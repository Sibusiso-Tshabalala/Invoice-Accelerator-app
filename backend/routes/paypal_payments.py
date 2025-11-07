import os
import paypalrestsdk
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

paypal_payments = Blueprint('paypal_payments', __name__)

# Configure PayPal
paypalrestsdk.configure({
    "mode": "sandbox",  # Change to "live" for production
    "client_id": os.environ.get('PAYPAL_CLIENT_ID', 'test_client_id'),
    "client_secret": os.environ.get('PAYPAL_SECRET', 'test_secret')
})

PLANS = {
    'basic': {
        'name': 'Basic Plan',
        'price': '29.00',
        'description': 'Perfect for small businesses - 100 invoices/month',
        'features': ['100 invoices/month', 'Basic analytics', 'Email support']
    },
    'pro': {
        'name': 'Professional Plan', 
        'price': '79.00',
        'description': 'For growing businesses - Unlimited invoices',
        'features': ['Unlimited invoices', 'Advanced analytics', 'Priority support', 'Custom branding']
    },
    'enterprise': {
        'name': 'Enterprise Plan',
        'price': '199.00', 
        'description': 'For large organizations - Full features',
        'features': ['Everything in Pro', 'API access', 'Dedicated account manager', 'SLA guarantee']
    }
}

@paypal_payments.route('/create-payment', methods=['POST'])
@cross_origin()
def create_payment():
    try:
        data = request.json
        plan_id = data.get('planId')
        
        if plan_id not in PLANS:
            return jsonify({'error': 'Invalid plan'}), 400
        
        plan = PLANS[plan_id]
        
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/payment/success",
                "cancel_url": "http://localhost:3000/payment/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": plan['name'],
                        "sku": plan_id,
                        "price": plan['price'],
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "total": plan['price'],
                    "currency": "USD"
                },
                "description": plan['description']
            }]
        })

        if payment.create():
            # Find approval URL
            for link in payment.links:
                if link.rel == "approval_url":
                    return jsonify({
                        'success': True,
                        'approvalUrl': link.href,
                        'paymentId': payment.id
                    })
        
        return jsonify({'error': 'Payment creation failed', 'details': payment.error}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@paypal_payments.route('/execute-payment', methods=['POST'])
@cross_origin() 
def execute_payment():
    try:
        data = request.json
        payment_id = data.get('paymentId')
        payer_id = data.get('payerId')

        payment = paypalrestsdk.Payment.find(payment_id)
        
        if payment.execute({"payer_id": payer_id}):
            return jsonify({
                'success': True,
                'message': 'Payment completed successfully!',
                'paymentId': payment_id
            })
        else:
            return jsonify({'error': payment.error}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@paypal_payments.route('/plans')
@cross_origin()
def get_plans():
    return jsonify(PLANS)

@paypal_payments.route('/test')
@cross_origin()
def test():
    return jsonify({'message': 'PayPal routes are working! 🎉'})