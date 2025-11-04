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
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-change-in-production')

if os.getenv('DATABASE_URL'):
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL').replace('postgres://', 'postgresql://')
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///invoices.db'# Change this!

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///invoices.db'
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
    
    # Relationship with invoices
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
    client_email = db.Column(db.String(100), nullable=False)  # NEW FIELD
    invoice_amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.String(50), nullable=False)
    days_overdue = db.Column(db.Integer, default=0)
    generated_email = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Foreign key to User
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

# User loader for Flask-Login - FIXED for SQLAlchemy 2.0
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# Create the database tables
with app.app_context():
    db.create_all()
def send_email_via_sendgrid(to_email, subject, html_content):
    """Send email using SendGrid"""
    try:
        message = Mail(
            from_email='noreply@invoiceaccelerator.com',  # Change this to your domain
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
    
# Authentication routes
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.json
        email = data.get('email')
        password = data.get('password')
        company_name = data.get('company_name')
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'error': 'Email already registered'})
        
        # Create new user
        new_user = User(email=email, company_name=company_name)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        # Log the user in
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

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# Protected routes
@app.route('/')
@login_required
def home():
    # Get recent invoices for the current user only
    recent_invoices = Invoice.query.filter_by(user_id=current_user.id).order_by(Invoice.created_at.desc()).limit(5).all()
    return render_template('index.html', recent_invoices=recent_invoices, company_name=current_user.company_name)

@app.route('/generate_email', methods=['POST'])
@login_required
def generate_email():
    try:
        # Get data from the frontend form
        data = request.json
        client_name = data.get('client_name')
        invoice_amount = data.get('invoice_amount')
        due_date = data.get('due_date')
        days_overdue = data.get('days_overdue', 7)

        # Create the prompt for OpenAI
        prompt = f"""
        Write a professional but firm email to a client named {client_name} regarding their overdue invoice for R {invoice_amount}. 
        The invoice was due on {due_date} and is now {days_overdue} days overdue.
        
        The tone should be:
        - Professional and polite
        - Clear about the amount and due date
        - Firm about the need for payment
        - Include a call to action (asking for payment or an update)
        
        Keep it concise and under 150 words.
        """

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional accounts manager for a small business. Write clear, professional payment reminder emails."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200
        )

        # Extract the generated email
        generated_email = response.choices[0].message.content

        # Save to database with user_id
        new_invoice = Invoice(
            client_name=client_name,
            invoice_amount=float(invoice_amount),
            due_date=due_date,
            days_overdue=int(days_overdue),
            generated_email=generated_email,
            user_id=current_user.id  # Link to current user
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
    """API endpoint to get all invoices for the current user"""
    invoices = Invoice.query.filter_by(user_id=current_user.id).order_by(Invoice.created_at.desc()).all()
    invoices_list = []
    for invoice in invoices:
        invoices_list.append({
            'id': invoice.id,
            'client_name': invoice.client_name,
            'invoice_amount': invoice.invoice_amount,
            'due_date': invoice.due_date,
            'days_overdue': invoice.days_overdue,
            'status': invoice.status,
            'created_at': invoice.created_at.strftime('%Y-%m-%d %H:%M')
        })
    return jsonify(invoices_list)

@app.route('/update_status/<int:invoice_id>', methods=['POST'])
@login_required
def update_status(invoice_id):
    """Update invoice status (paid, pending, etc.)"""
    try:
        # Ensure the invoice belongs to the current user
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
        
        data = request.json
        new_status = data.get('status')
        
        invoice.status = new_status
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Status updated'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/dashboard')
@login_required
def dashboard():
    """User dashboard with stats"""
    total_invoices = Invoice.query.filter_by(user_id=current_user.id).count()
    pending_invoices = Invoice.query.filter_by(user_id=current_user.id, status='pending').count()
    paid_invoices = Invoice.query.filter_by(user_id=current_user.id, status='paid').count()
    
    return jsonify({
        'company_name': current_user.company_name,
        'total_invoices': total_invoices,
        'pending_invoices': pending_invoices,
        'paid_invoices': paid_invoices
    })

@app.route('/send_email/<int:invoice_id>', methods=['POST'])
@login_required
def send_invoice_email(invoice_id):
    try:
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
        
        # Use the actual client email from the database
        client_email = invoice.client_email
        
        subject = f"Payment Reminder: Invoice for R {invoice.invoice_amount}"
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">{current_user.company_name}</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Payment Reminder</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Dear {invoice.client_name},</p>
                {invoice.generated_email.replace('\n', '<br>')}
                <br><br>
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                    <strong>Invoice Details:</strong><br>
                    Amount: R {invoice.invoice_amount}<br>
                    Due Date: {invoice.due_date}<br>
                    Days Overdue: {invoice.days_overdue}
                </div>
                <br>
                <p>Best regards,<br><strong>{current_user.company_name}</strong></p>
            </div>
        </div>
        """
        
        if send_email_via_sendgrid(client_email, subject, html_content):
            invoice.status = 'sent'
            db.session.commit()
            return jsonify({'success': True, 'message': 'Email sent successfully!'})
        else:
            return jsonify({'success': False, 'error': 'Failed to send email'})
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    
@app.route('/pricing')
def pricing():
    return render_template('pricing.html')

if __name__ == '__main__':
    app.run(debug=True)