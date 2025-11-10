import re
from flask import jsonify

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_user_registration(data):
    errors = []
    
    if not data.get('email') or not validate_email(data['email']):
        errors.append('Valid email is required')
    
    if not data.get('password') or len(data['password']) < 6:
        errors.append('Password must be at least 6 characters')
    
    if not data.get('company_name') or len(data['company_name'].strip()) < 2:
        errors.append('Company name is required')
    
    return errors

def validate_invoice_data(data):
    errors = []
    
    if not data.get('client_name') or len(data['client_name'].strip()) < 2:
        errors.append('Valid client name is required')
    
    if not data.get('client_email') or not validate_email(data['client_email']):
        errors.append('Valid client email is required')
    
    try:
        amount = float(data.get('invoice_amount', 0))
        if amount <= 0:
            errors.append('Invoice amount must be positive')
    except (ValueError, TypeError):
        errors.append('Valid invoice amount is required')
    
    if not data.get('due_date'):
        errors.append('Due date is required')
    
    return errors

def validate_payment_data(data):
    errors = []
    
    valid_plans = ['basic', 'pro', 'enterprise']
    if data.get('planId') not in valid_plans:
        errors.append('Valid plan ID is required')
    
    return errors