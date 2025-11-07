import os
import stripe
from flask import Blueprint, request, jsonify, url_for
from flask_cors import cross_origin

payments = Blueprint('payments', __name__)

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Payment plans
PLANS = {
    'basic': {
        'price_id': 'price_basic_monthly',  # You'll create this in Stripe dashboard
        'name': 'Basic Plan',
        'price': 29,
        'features': ['100 invoices/month', 'Basic analytics', 'Email support']
    },
    'pro': {
        'price_id': 'price_pro_monthly',
        'name': 'Professional Plan',
        'price': 79,
        'features': ['Unlimited invoices', 'Advanced analytics', 'Priority support', 'Custom branding']
    },
    'enterprise': {
        'price_id': 'price_enterprise_monthly',
        'name': 'Enterprise Plan',
        'price': 199,
        'features': ['Everything in Pro', 'API access', 'Dedicated account manager', 'SLA guarantee']
    }
}

@payments.route('/create-checkout-session', methods=['POST'])
@cross_origin()
def create_checkout_session():
    try:
        data = request.json
        plan_id = data.get('planId')
        
        if plan_id not in PLANS:
            return jsonify({'error': 'Invalid plan'}), 400
        
        plan = PLANS[plan_id]
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': plan['price_id'],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=url_for('payments.success', _external=True) + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=url_for('payments.cancel', _external=True),
            metadata={
                'plan_id': plan_id
            }
        )
        
        return jsonify({'checkoutUrl': checkout_session.url})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments.route('/success')
@cross_origin()
def success():
    return jsonify({'message': 'Payment successful! Welcome to InvoiceAccelerator!'})

@payments.route('/cancel')
@cross_origin()
def cancel():
    return jsonify({'message': 'Payment cancelled. You can try again anytime.'})

@payments.route('/create-portal-session', methods=['POST'])
@cross_origin()
def create_portal_session():
    try:
        data = request.json
        session_id = data.get('sessionId')
        
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        
        portal_session = stripe.billing_portal.Session.create(
            customer=checkout_session.customer,
            return_url=url_for('payments.success', _external=True),
        )
        
        return jsonify({'portalUrl': portal_session.url})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments.route('/plans')
@cross_origin()
def get_plans():
    return jsonify(PLANS)