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

# Load environment variables from .env file
if os.path.exists('.env'):
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

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

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
    return render_template('landing.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.json
        email = data.get('email')
        password = data.get('password')
        company_name = data.get('company_name')
        
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'error': 'Email already registered'})
        
        new_user = User(email=email, company_name=company_name)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        login_user(new_user)
        return jsonify({'success': True, 'message': 'Registration successful'})
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user)
            return jsonify({'success': True, 'message': 'Login successful'})
        else:
            return jsonify({'success': False, 'error': 'Invalid email or password'})
    
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    recent_invoices = Invoice.query.filter_by(user_id=current_user.id).order_by(Invoice.created_at.desc()).limit(5).all()
    return render_template('index.html', recent_invoices=recent_invoices, company_name=current_user.company_name)

@app.route('/generate_email', methods=['POST'])
@login_required
def generate_email():
    try:
        data = request.json
        client_name = data.get('client_name')
        client_email = data.get('client_email')
        invoice_amount = data.get('invoice_amount')
        due_date = data.get('due_date')
        days_overdue = data.get('days_overdue', 7)

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

# Add other routes (invoices, update_status, send_email, etc.) from your previous version

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Invoice Accelerator is running with PostgreSQL!'})

if __name__ == '__main__':
    app.run(debug=True)