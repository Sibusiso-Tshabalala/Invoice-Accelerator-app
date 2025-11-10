import os
import json
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from flask_cors import CORS , cross_origin
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-change-in-production')

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Database configuration - Railway now provides DATABASE_URL
if os.getenv('DATABASE_URL'):
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL').replace('postgres://', 'postgresql://')
    print("✅ Using PostgreSQL database from Railway")
else:
    # Fallback - should not happen now
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///invoices.db'
    print("❌ WARNING: Using SQLite fallback")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_recycle': 300,
    'pool_pre_ping': True
}

# Initialize database and login manager
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Initialize OpenAI client (only if API key is available)
client = None
try:
    api_key = os.getenv('OPENROUTER_API_KEY')
    if api_key:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "http://localhost:3000",  # Your site URL
                "X-Title": "InvoiceAccelerator"  # Your app name
            }
        )
        print("✅ OpenRouter AI client initialized successfully")
    else:
        print("⚠️ OpenRouter API key not found - AI features disabled")
        client = None
except Exception as e:
    print(f"❌ OpenRouter initialization failed: {e}")
    client = None

# CORS configuration
CORS(app, 
     origins=["http://localhost:3000"],
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE"])

# Import validators and logger
try:
    from validators import validate_user_registration, validate_invoice_data, validate_payment_data
    print("✅ Validators imported successfully")
except ImportError as e:
    print(f"⚠️ Validators not available: {e}")
    # Fallback validation functions
    def validate_user_registration(data):
        return []
    def validate_invoice_data(data):
        return []
    def validate_payment_data(data):
        return []

try:
    from logger import logger, log_database_operation, log_ai_operation, log_payment_operation, log_error
    print("✅ Logger imported successfully")
except ImportError as e:
    print(f"⚠️ Logger not available: {e}")
    # Fallback logging functions
    def logger(*args, **kwargs): pass
    def log_database_operation(*args, **kwargs): pass
    def log_ai_operation(*args, **kwargs): pass
    def log_payment_operation(*args, **kwargs): pass
    def log_error(*args, **kwargs): pass

# Import PayPal service
try:
    from services.paypal_service import paypal_service
    print("✅ PayPal service imported successfully")
except ImportError as e:
    print(f"⚠️ PayPal service not available: {e}")
    paypal_service = None

# User model
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    company_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    invoices = db.relationship('Invoice', backref='business', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Invoice model
class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    client_name = db.Column(db.String(100), nullable=False)
    client_email = db.Column(db.String(100), nullable=False)
    invoice_amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.String(50), nullable=False)
    days_overdue = db.Column(db.Integer, default=0)
    generated_email = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

def send_email_via_sendgrid(to_email, subject, html_content):
    """Send email using SendGrid"""
    try:
        message = Mail(
            from_email='noreply@invoiceaccelerator.com',
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# Database connection health check
@app.before_request
def check_database_connection():
    try:
        # Test database connection with explicit text()
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return jsonify({
            'success': False, 
            'error': 'Database connection unavailable'
        }), 503

# Register PayPal blueprint if available
try:
    from routes.paypal_payments import paypal_payments
    app.register_blueprint(paypal_payments, url_prefix='/api/paypal')
    print("✅ PayPal payments blueprint registered")
    
    # Check PayPal configuration
    if paypal_service and paypal_service.is_configured:
        print("✅ PayPal is configured and ready")
    else:
        print("⚠️ PayPal is in simulation mode - add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env for real payments")
        
except ImportError as e:
    print(f"⚠️ PayPal routes not available: {e}")

# Register invoices blueprint if available
try:
    from routes.invoices import invoices
    app.register_blueprint(invoices, url_prefix='/api/invoices')
    print("✅ Invoices blueprint registered")
except ImportError as e:
    print(f"⚠️ Invoice routes not available: {e}")

# Create the database tables
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Database error: {e}")

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        'success': False, 
        'error': 'Rate limit exceeded. Please try again later.'
    }), 429

# Routes
@app.route('/')
def home():
    return jsonify({"message": "InvoiceAccelerator API is running! 🚀", "status": "success"})

@app.route('/register', methods=['POST'])
@limiter.limit("10 per hour")
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'})
            
        # Input validation
        errors = validate_user_registration(data)
        if errors:
            return jsonify({'success': False, 'error': '; '.join(errors)}), 400
            
        email = data.get('email')
        password = data.get('password')
        company_name = data.get('company_name')
        
        if not all([email, password, company_name]):
            return jsonify({'success': False, 'error': 'All fields are required'})
        
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'error': 'Email already registered'})
        
        new_user = User(email=email, company_name=company_name)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        login_user(new_user)
        log_database_operation('user_registration', new_user.id, f"Company: {company_name}")
        return jsonify({'success': True, 'message': 'Registration successful'})
        
    except Exception as e:
        log_error('registration', e)
        return jsonify({'success': False, 'error': 'Registration failed'}), 500

@app.route('/login', methods=['POST'])
@limiter.limit("10 per hour")
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'})
            
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return jsonify({'success': False, 'error': 'Email and password are required'})
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user)
            log_database_operation('user_login', user.id)
            return jsonify({'success': True, 'message': 'Login successful'})
        else:
            return jsonify({'success': False, 'error': 'Invalid email or password'})
            
    except Exception as e:
        log_error('login', e)
        return jsonify({'success': False, 'error': 'Login failed'}), 500

@app.route('/dashboard')
@login_required
def dashboard():
    recent_invoices = Invoice.query.filter_by(user_id=current_user.id).order_by(Invoice.created_at.desc()).limit(5).all()
    invoices_data = [
        {
            'id': invoice.id,
            'client_name': invoice.client_name,
            'client_email': invoice.client_email,
            'invoice_amount': invoice.invoice_amount,
            'due_date': invoice.due_date,
            'status': invoice.status
        }
        for invoice in recent_invoices
    ]
    return jsonify({
        'company_name': current_user.company_name,
        'recent_invoices': invoices_data
    })

@app.route('/generate_email', methods=['POST'])
@login_required
@limiter.limit("30 per hour")
def generate_email():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'})
            
        # Input validation
        errors = validate_invoice_data(data)
        if errors:
            return jsonify({'success': False, 'error': '; '.join(errors)}), 400
            
        client_name = data.get('client_name')
        client_email = data.get('client_email')
        invoice_amount = data.get('invoice_amount')
        due_date = data.get('due_date')
        days_overdue = data.get('days_overdue', 7)

        if not all([client_name, client_email, invoice_amount, due_date]):
            return jsonify({'success': False, 'error': 'All fields are required'})

        # Check if OpenAI client is available
        if not client:
            return jsonify({
                'success': False, 
                'error': 'AI features are currently unavailable. Please try again later.'
            })

        prompt = f"""
        Write a professional but firm email to a client named {client_name} regarding their overdue invoice for R {invoice_amount}. 
        The invoice was due on {due_date} and is now {days_overdue} days overdue.
        
        Keep it concise and under 150 words.
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional accounts manager for a small business. Write clear, professional payment reminder emails."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200
        )

        generated_email = response.choices[0].message.content

        new_invoice = Invoice(
            client_name=client_name,
            client_email=client_email,
            invoice_amount=float(invoice_amount),
            due_date=due_date,
            days_overdue=int(days_overdue),
            generated_email=generated_email,
            user_id=current_user.id
        )
        
        db.session.add(new_invoice)
        db.session.commit()

        log_ai_operation('email_generated', current_user.id, f"Client: {client_name}")
        return jsonify({
            'success': True,
            'email': generated_email,
            'invoice_id': new_invoice.id
        })

    except Exception as e:
        log_error('generate_email', e, current_user.id if current_user.is_authenticated else None)
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/invoices')
@login_required
def get_invoices():
    try:
        invoices = Invoice.query.filter_by(user_id=current_user.id).order_by(Invoice.created_at.desc()).all()
        invoices_data = [
            {
                'id': invoice.id,
                'client_name': invoice.client_name,
                'client_email': invoice.client_email,
                'invoice_amount': invoice.invoice_amount,
                'due_date': invoice.due_date,
                'days_overdue': invoice.days_overdue,
                'status': invoice.status,
                'created_at': invoice.created_at.isoformat()
            }
            for invoice in invoices
        ]
        return jsonify({'success': True, 'invoices': invoices_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/update_status', methods=['POST'])
@login_required
def update_status():
    try:
        data = request.get_json()
        invoice_id = data.get('invoice_id')
        status = data.get('status')
        
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first()
        if invoice:
            invoice.status = status
            db.session.commit()
            return jsonify({'success': True, 'message': 'Status updated successfully'})
        else:
            return jsonify({'success': False, 'error': 'Invoice not found'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/send_email', methods=['POST'])
@login_required
def send_email():
    try:
        data = request.get_json()
        invoice_id = data.get('invoice_id')
        
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first()
        if not invoice:
            return jsonify({'success': False, 'error': 'Invoice not found'})
        
        # Send email using SendGrid
        subject = f"Payment Reminder: Overdue Invoice - {invoice.client_name}"
        html_content = f"""
        <html>
            <body>
                <h2>Payment Reminder</h2>
                <p>Dear {invoice.client_name},</p>
                <p>{invoice.generated_email}</p>
                <p>Best regards,<br>{current_user.company_name}</p>
            </body>
        </html>
        """
        
        if send_email_via_sendgrid(invoice.client_email, subject, html_content):
            invoice.status = 'sent'
            db.session.commit()
            return jsonify({'success': True, 'message': 'Email sent successfully'})
        else:
            return jsonify({'success': False, 'error': 'Failed to send email'})
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/health')
@limiter.exempt
def health_check():
    return jsonify({
        'status': 'healthy', 
        'message': 'Invoice Accelerator is running!',
        'database': 'PostgreSQL' if os.getenv('DATABASE_URL') else 'SQLite',
        'openai_available': client is not None,
        'paypal_configured': paypal_service.is_configured if paypal_service else False
    })

# Keep your existing PayPal test routes (they'll work as fallbacks)
@app.route('/api/paypal/test')
def paypal_test():
    print("🎯 PAYPAL TEST ENDPOINT HIT")
    return jsonify({'message': 'PayPal endpoint is working! 💳', 'status': 'success'})

@app.route('/api/paypal/create-payment', methods=['POST'])
def create_payment():
    print("🎯 SIMULATED PAYPAL ENDPOINT HIT - NO REAL PAYPAL")
    
    # Get the request data
    data = request.get_json()
    plan_id = data.get('planId', 'unknown')
    
    print(f"📦 Simulating payment for plan: {plan_id}")
    
    # Return immediate success - NO EXTERNAL API CALLS AT ALL
    return jsonify({
        'success': True,
        'message': '🎉 Payment simulation successful!',
        'planId': plan_id,
        'approvalUrl': 'http://localhost:3000',  # Redirect back to frontend
        'test_mode': True,
        'simulation': 'COMPLETELY BYPASSED PAYPAL API',
        'status': 'active',
        'features_unlocked': ['all_features']
    })
    
@app.route('/api/simple-payment', methods=['POST'])
def simple_payment():
    print("🎯 SIMPLE PAYMENT ENDPOINT HIT")
    try:
        data = request.get_json()
        print("📦 Simple endpoint received:", data)
        
        return jsonify({
            'success': True,
            'message': 'Simple payment test successful!',
            'received_data': data,
            'backend': 'working'
        })
        
    except Exception as e:
        print("💥 Simple payment error:", e)
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/emergency-test', methods=['POST'])
def emergency_test():
    print("🚨 EMERGENCY TEST ENDPOINT HIT - NO TRY/CATCH")
    data = request.get_json()
    print(f"🚨 Emergency test received: {data}")
    
    # Direct return without any processing
    return jsonify({
        'success': True,
        'message': 'EMERGENCY TEST WORKS!',
        'data_received': data
    })
    

@app.route('/payment-success')
def payment_success():
    return """
    <html>
        <head><title>Payment Success</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: green;">🎉 Payment Successful!</h1>
            <p>Your payment has been processed successfully.</p>
            <p>This is a simulation - real PayPal integration will be added later.</p>
            <button onclick="window.close()">Close</button>
        </body>
    </html>
    """
    
# AI-Powered Features
@app.route('/api/ai/generate-email', methods=['POST'])
@cross_origin()
@limiter.limit("20 per hour")
def generate_ai_email():
    """Generate professional payment reminder email using AI"""
    try:
        data = request.get_json()
        
        client_name = data.get('client_name')
        invoice_amount = data.get('invoice_amount')
        due_date = data.get('due_date')
        days_overdue = data.get('days_overdue', 0)
        tone = data.get('tone', 'professional')  # professional, friendly, firm
        
        if not client_name or not invoice_amount:
            return jsonify({'success': False, 'error': 'Client name and amount are required'}), 400

        # Check if OpenAI is available
        if not client:
            return jsonify({
                'success': False, 
                'error': 'AI features are currently unavailable. Please add your OpenAI API key.'
            })

        prompt = f"""
        Write a {tone} payment reminder email to a client named {client_name} regarding their overdue invoice for R {invoice_amount}. 
        The invoice was due on {due_date} and is now {days_overdue} days overdue.

        Requirements:
        - Keep it under 150 words
        - Use South African business English
        - Include a clear call-to-action for payment
        - Be firm but respectful
        - Offer assistance if needed

        Tone: {tone}
        """
        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-exp:free",  # Working free model
            messages=[
                {
                    "role": "system", 
                    "content": "You are a professional accounts manager. Write clear, professional payment reminder emails that maintain good client relationships while ensuring timely payments. Keep responses under 150 words."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=250,
            temperature=0.7
        )

        generated_email = response.choices[0].message.content

        log_ai_operation('ai_email_generated', None, f"Client: {client_name}, Tone: {tone}")
        return jsonify({
            'success': True,
            'email': generated_email,
            'tone': tone,
            'word_count': len(generated_email.split())
        })

    except Exception as e:
        print(f"AI Email Error: {e}")
        log_error('ai_generate_email', e)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/analyze-invoice', methods=['POST'])
@cross_origin()
@limiter.limit("15 per hour")
def analyze_invoice():
    """AI analysis using OpenRouter"""
    try:
        data = request.get_json()
        invoice_data = data.get('invoices', [])
        
        if not client:
            return jsonify({
                'success': False, 
                'error': 'AI features unavailable.'
            })

        prompt = f"""
        Analyze this invoice data and provide business insights:
        {json.dumps(invoice_data, indent=2)}
        
        Provide:
        1. Payment pattern analysis
        2. Client payment behavior insights
        3. Recommendations for improving cash flow
        4. Risk assessment for late payments
        
        Keep response under 300 words and focused on actionable insights.
        """

        response = client.chat.completions.create(
            model="google/gemini-pro:free",  # Free model via OpenRouter
            messages=[
                {
                    "role": "system", 
                    "content": "You are a financial analyst specializing in accounts receivable and cash flow optimization. Provide concise, actionable insights."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=400,
            temperature=0.5
        )

        analysis = response.choices[0].message.content

        log_ai_operation('invoice_analysis', None, f"Invoices analyzed: {len(invoice_data)}")
        return jsonify({
            'success': True,
            'analysis': analysis,
            'timestamp': datetime.utcnow().isoformat()
        })

    except Exception as e:
        print(f"AI Analysis Error: {e}")
        log_error('ai_analyze_invoice', e)
        return jsonify({'success': False, 'error': str(e)}), 500
    
@app.route('/api/ai/chat', methods=['POST'])
@cross_origin()
@limiter.limit("20 per hour")
def ai_chat():
    """AI Chat assistant using OpenRouter"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        conversation_history = data.get('conversation_history', [])

        if not user_message:
            return jsonify({'success': False, 'error': 'Message is required'}), 400

        if not client:
            return jsonify({
                'success': False, 
                'error': 'AI chat is currently unavailable.'
            })

        # Build conversation context
        messages = [
            {
                "role": "system", 
                "content": """You are InvoiceAccelerator AI, a helpful assistant for invoicing and payment management. 
                You help businesses with:
                - Writing professional payment reminders
                - Invoice template creation
                - Payment follow-up strategies
                - Cash flow optimization
                - Client communication best practices
                
                Keep responses concise, helpful, and focused on invoicing and payments.
                Offer practical advice and suggest features of InvoiceAccelerator when relevant."""
            }
        ]

        # Add conversation history for context
        for msg in conversation_history[-6:]:
            role = "user" if msg.get('sender') == 'user' else "assistant"
            messages.append({"role": role, "content": msg.get('text', '')})

        # Add current message
        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-exp:free",  # Use the same working model
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )

        ai_response = response.choices[0].message.content

        log_ai_operation('ai_chat', None, f"Message length: {len(user_message)}")
        return jsonify({
            'success': True,
            'response': ai_response
        })

    except Exception as e:
        print(f"AI Chat Error: {e}")
        log_error('ai_chat', e)
        return jsonify({'success': False, 'error': str(e)}), 500

def get_ai_client():
    try:
        if not client:
            return None
        # Test connection
        client.models.list()
        return client
    except Exception:
        return None

if __name__ == '__main__':
    print("🚀 Server starting on http://localhost:5000")
    print("💳 Available routes:")
    print("   GET  /              - API status")
    print("   GET  /health        - Health check")
    print("   POST /register      - User registration")
    print("   POST /login         - User login")
    print("   POST /generate_email - Generate AI email")
    print("   GET  /invoices      - Get user invoices")
    print("   POST /send_email    - Send email to client")
    app.run(host='0.0.0.0', port=5000, debug=False)