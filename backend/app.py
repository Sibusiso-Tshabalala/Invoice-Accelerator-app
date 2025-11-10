import os
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

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-change-in-production')

# Database configuration - Railway now provides DATABASE_URL
if os.getenv('DATABASE_URL'):
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL').replace('postgres://', 'postgresql://')
    print("✅ Using PostgreSQL database from Railway")
else:
    # Fallback - should not happen now
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///invoices.db'
    print("❌ WARNING: Using SQLite fallback")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database and login manager
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Initialize OpenAI client (only if API key is available)
client = None
if os.getenv('OPENAI_API_KEY'):
    try:
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        print("✅ OpenAI client initialized successfully")
    except Exception as e:
        print(f"❌ OpenAI initialization failed: {e}")
        client = None
else:
    print("⚠️ OpenAI API key not found - AI features disabled")

# CORS configuration
CORS(app, origins=["http://localhost:3000"])

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

# Register PayPal blueprint if available
try:
    from routes.paypal_payments import paypal_payments
    app.register_blueprint(paypal_payments, url_prefix='/api/paypal')
    print("✅ PayPal payments blueprint registered")
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

# Routes
@app.route('/')
def home():
    return jsonify({"message": "InvoiceAccelerator API is running! 🚀", "status": "success"})

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'})
            
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
        return jsonify({'success': True, 'message': 'Registration successful'})
    
    return jsonify({'message': 'Register endpoint - use POST to register'})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
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
            return jsonify({'success': True, 'message': 'Login successful'})
        else:
            return jsonify({'success': False, 'error': 'Invalid email or password'})
    
    return jsonify({'message': 'Login endpoint - use POST to login'})

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
def generate_email():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'})
            
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

        return jsonify({
            'success': True,
            'email': generated_email,
            'invoice_id': new_invoice.id
        })

    except Exception as e:
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
def health_check():
    return jsonify({
        'status': 'healthy', 
        'message': 'Invoice Accelerator is running!',
        'database': 'PostgreSQL' if os.getenv('DATABASE_URL') else 'SQLite',
        'openai_available': client is not None
    })

@app.route('/api/paypal/test')
def paypal_test():
    print("🎯 PAYPAL TEST ENDPOINT HIT")
    return jsonify({'message': 'PayPal endpoint is working! 💳', 'status': 'success'})

@app.route('/api/paypal/create-payment', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_payment():
    print("🎯 PAYPAL CREATE-PAYMENT ENDPOINT HIT")
    try:
        data = request.get_json()
        print("📦 Received data:", data)
        
        plan_id = data.get('planId')
        print("📋 Plan ID requested:", plan_id)
        
        # For now, just return a success message without actual PayPal
        return jsonify({
            'success': True,
            'message': 'Payment endpoint working!',
            'planId': plan_id,
            'test_mode': True
        })
        
    except Exception as e:
        print("💥 Error in create-payment:", str(e))
        return jsonify({'error': str(e)}), 500

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