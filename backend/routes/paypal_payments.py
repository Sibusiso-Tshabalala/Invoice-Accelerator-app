from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from flask_cors import cross_origin
from services.paypal_service import paypal_service
from logger import log_payment_operation

paypal_payments = Blueprint('paypal_payments', __name__)

PLANS = {
    'basic': {
        'name': 'Basic Plan',
        'price': '299',
        'currency': 'ZAR',
        'description': 'Perfect for small businesses - 100 invoices/month',
        'features': ['100 invoices/month', 'Basic analytics', 'Email support', 'Standard templates']
    },
    'pro': {
        'name': 'Professional Plan', 
        'price': '799',
        'currency': 'ZAR',
        'description': 'For growing businesses - Unlimited invoices',
        'features': ['Unlimited invoices', 'Advanced analytics', 'Priority support', 'Custom branding']
    },
    'enterprise': {
        'name': 'Enterprise Plan',
        'price': '1999',
        'currency': 'ZAR',
        'description': 'For large organizations - Full features',
        'features': ['Everything in Pro', 'API access', 'Dedicated account manager', 'SLA guarantee']
    }
}

@paypal_payments.route('/create-subscription', methods=['POST'])
@login_required
@cross_origin()
def create_subscription():
    """Create a PayPal subscription"""
    try:
        data = request.get_json()
        plan_id = data.get('planId')
        
        if not plan_id or plan_id not in PLANS:
            return jsonify({'success': False, 'error': 'Invalid plan ID'}), 400
        
        result = paypal_service.create_subscription(
            plan_id=plan_id,
            user_email=current_user.email,
            user_id=current_user.id
        )
        
        if result['success']:
            log_payment_operation('subscription_created_success', current_user.id, plan_id)
            return jsonify(result)
        else:
            log_payment_operation('subscription_created_failed', current_user.id, plan_id, result['error'])
            return jsonify(result), 400
            
    except Exception as e:
        log_payment_operation('subscription_route_error', current_user.id if current_user.is_authenticated else None, 
                            plan_id, str(e))
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@paypal_payments.route('/create-payment', methods=['POST'])
@login_required
@cross_origin()
def create_payment():
    """Create a one-time PayPal payment"""
    try:
        data = request.get_json()
        plan_id = data.get('planId')
        
        if not plan_id or plan_id not in PLANS:
            return jsonify({'success': False, 'error': 'Invalid plan ID'}), 400
        
        result = paypal_service.create_one_time_payment(
            plan_id=plan_id,
            user_email=current_user.email,
            user_id=current_user.id
        )
        
        if result['success']:
            log_payment_operation('payment_created_success', current_user.id, plan_id)
            return jsonify(result)
        else:
            log_payment_operation('payment_created_failed', current_user.id, plan_id, result['error'])
            return jsonify(result), 400
            
    except Exception as e:
        log_payment_operation('payment_route_error', current_user.id if current_user.is_authenticated else None, 
                            plan_id, str(e))
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@paypal_payments.route('/execute-payment', methods=['POST'])
@login_required
@cross_origin()
def execute_payment():
    """Execute a payment after user approval"""
    try:
        data = request.get_json()
        payment_id = data.get('paymentId')
        payer_id = data.get('payerId')
        
        if not payment_id or not payer_id:
            return jsonify({'success': False, 'error': 'Payment ID and Payer ID are required'}), 400
        
        result = paypal_service.execute_payment(payment_id, payer_id)
        
        if result['success']:
            log_payment_operation('payment_executed', current_user.id, payment_id, "Success")
            
            # Here you would typically:
            # 1. Update user's subscription status in database
            # 2. Grant premium features
            # 3. Send confirmation email
            
            return jsonify({
                'success': True,
                'message': 'Payment completed successfully!',
                'payment_id': payment_id,
                'status': result.get('state', 'completed')
            })
        else:
            log_payment_operation('payment_execution_failed', current_user.id, payment_id, result['error'])
            return jsonify(result), 400
            
    except Exception as e:
        log_payment_operation('payment_execution_error', current_user.id if current_user.is_authenticated else None, 
                            payment_id, str(e))
        return jsonify({'success': False, 'error': 'Payment execution failed'}), 500

@paypal_payments.route('/plans')
@cross_origin()
def get_plans():
    """Get available subscription plans"""
    return jsonify(PLANS)

@paypal_payments.route('/config')
@cross_origin()
def get_config():
    """Get PayPal configuration status"""
    return jsonify({
        'paypal_configured': paypal_service.is_configured,
        'mode': paypal_service.mode,
        'test_mode': not paypal_service.is_configured
    })

@paypal_payments.route('/webhook', methods=['POST'])
@cross_origin()
def webhook():
    """Handle PayPal webhook events"""
    try:
        # PayPal webhook verification would go here
        webhook_data = request.get_json()
        event_type = webhook_data.get('event_type')
        
        log_payment_operation('webhook_received', None, None, f"Event: {event_type}")
        
        # Handle different webhook events
        if event_type == 'PAYMENT.SALE.COMPLETED':
            # Payment completed
            pass
        elif event_type == 'BILLING.SUBSCRIPTION.ACTIVATED':
            # Subscription activated
            pass
        elif event_type == 'BILLING.SUBSCRIPTION.CANCELLED':
            # Subscription cancelled
            pass
            
        return jsonify({'success': True})
        
    except Exception as e:
        log_payment_operation('webhook_error', None, None, str(e))
        return jsonify({'success': False, 'error': str(e)}), 500