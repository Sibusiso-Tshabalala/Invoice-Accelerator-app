from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

paypal_payments = Blueprint('paypal_payments', __name__)

PLANS = {
    'basic': {
        'name': 'Basic Plan',
        'price': '299',  # ZAR per month
        'description': 'Perfect for small businesses - 100 invoices/month',
        'features': ['100 invoices/month', 'Basic analytics', 'Email support', 'Standard templates']
    },
    'pro': {
        'name': 'Professional Plan', 
        'price': '799',  # ZAR per month
        'description': 'For growing businesses - Unlimited invoices',
        'features': ['Unlimited invoices', 'Advanced analytics', 'Priority support', 'Custom branding']
    },
    'enterprise': {
        'name': 'Enterprise Plan',
        'price': '1999',  # ZAR per month
        'description': 'For large organizations - Full features',
        'features': ['Everything in Pro', 'API access', 'Dedicated account manager', 'SLA guarantee']
    }
}

@paypal_payments.route('/create-payment', methods=['POST'])
@cross_origin()
def create_payment():
    print("🎯 SIMPLE PAYPAL ENDPOINT - NO REAL PAYPAL")
    
    data = request.get_json()
    plan_id = data.get('planId', 'unknown')
    
    print(f"📦 Simulating payment for plan: {plan_id}")
    
    # Return immediate success - NO PAYPAL API
    return jsonify({
        'success': True,
        'message': '🎉 Payment simulation successful!',
        'planId': plan_id,
        'approvalUrl': 'http://localhost:3000',
        'test_mode': True,
        'note': 'Real PayPal disabled for development'
    })

@paypal_payments.route('/plans')
@cross_origin()
def get_plans():
    return jsonify(PLANS)

@paypal_payments.route('/test')
@cross_origin()
def test():
    return jsonify({'message': 'Simple PayPal routes are working! 🎉'})