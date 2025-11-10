import os
import paypalrestsdk
import requests
from flask import jsonify
from logger import logger, log_payment_operation

class PayPalService:
    def __init__(self):
        self.client_id = os.getenv('PAYPAL_CLIENT_ID')
        self.client_secret = os.getenv('PAYPAL_CLIENT_SECRET')
        self.mode = os.getenv('PAYPAL_MODE', 'sandbox')
        
        # Configure PayPal SDK
        paypalrestsdk.configure({
            "mode": self.mode,
            "client_id": self.client_id,
            "client_secret": self.client_secret
        })
        
        self.is_configured = bool(self.client_id and self.client_secret)
        
    def create_subscription(self, plan_id, user_email, user_id):
        """Create a PayPal subscription"""
        try:
            if not self.is_configured:
                return self._create_simulation_subscription(plan_id, user_email, user_id)
            
            # Define subscription plan mapping
            plan_map = {
                'basic': 'P-XXXBASICPLANID',  # Replace with actual PayPal plan IDs
                'pro': 'P-XXXPROPLANID',
                'enterprise': 'P-XXXENTERPRISEPLANID'
            }
            
            paypal_plan_id = plan_map.get(plan_id)
            if not paypal_plan_id:
                return {'success': False, 'error': 'Invalid plan ID'}
            
            subscription = paypalrestsdk.Subscription({
                "plan_id": paypal_plan_id,
                "subscriber": {
                    "email_address": user_email
                },
                "application_context": {
                    "brand_name": "InvoiceAccelerator",
                    "locale": "en-ZA",
                    "shipping_preference": "NO_SHIPPING",
                    "user_action": "SUBSCRIBE_NOW",
                    "payment_method": {
                        "payer_selected": "PAYPAL",
                        "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
                    },
                    "return_url": "http://localhost:3000/payment-success",
                    "cancel_url": "http://localhost:3000/payment-cancel"
                }
            })
            
            if subscription.create():
                log_payment_operation('subscription_created', user_id, plan_id, f"PayPal ID: {subscription.id}")
                return {
                    'success': True,
                    'subscription_id': subscription.id,
                    'approval_url': subscription.links[0].href if subscription.links else None,
                    'status': subscription.status
                }
            else:
                error_msg = subscription.error
                log_payment_operation('subscription_failed', user_id, plan_id, f"Error: {error_msg}")
                return {'success': False, 'error': error_msg}
                
        except Exception as e:
            log_payment_operation('subscription_error', user_id, plan_id, f"Exception: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def create_one_time_payment(self, plan_id, user_email, user_id):
        """Create a one-time payment (alternative to subscription)"""
        try:
            if not self.is_configured:
                return self._create_simulation_payment(plan_id, user_email, user_id)
            
            plan_prices = {
                'basic': '299.00',
                'pro': '799.00', 
                'enterprise': '1999.00'
            }
            
            amount = plan_prices.get(plan_id)
            if not amount:
                return {'success': False, 'error': 'Invalid plan ID'}
            
            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/payment-success",
                    "cancel_url": "http://localhost:3000/payment-cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": f"InvoiceAccelerator - {plan_id.title()} Plan",
                            "sku": plan_id,
                            "price": amount,
                            "currency": "ZAR",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "total": amount,
                        "currency": "ZAR"
                    },
                    "description": f"{plan_id.title()} Plan subscription"
                }]
            })
            
            if payment.create():
                log_payment_operation('payment_created', user_id, plan_id, f"PayPal ID: {payment.id}")
                
                # Find approval URL
                approval_url = next((link.href for link in payment.links if link.rel == "approval_url"), None)
                
                return {
                    'success': True,
                    'payment_id': payment.id,
                    'approval_url': approval_url,
                    'status': payment.state
                }
            else:
                error_msg = payment.error
                log_payment_operation('payment_failed', user_id, plan_id, f"Error: {error_msg}")
                return {'success': False, 'error': error_msg}
                
        except Exception as e:
            log_payment_operation('payment_error', user_id, plan_id, f"Exception: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def execute_payment(self, payment_id, payer_id):
        """Execute a payment after user approval"""
        try:
            payment = paypalrestsdk.Payment.find(payment_id)
            
            if payment.execute({"payer_id": payer_id}):
                return {
                    'success': True,
                    'payment_id': payment.id,
                    'state': payment.state,
                    'amount': payment.transactions[0].amount.total if payment.transactions else None
                }
            else:
                return {'success': False, 'error': payment.error}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _create_simulation_subscription(self, plan_id, user_email, user_id):
        """Fallback simulation when PayPal is not configured"""
        log_payment_operation('simulation_subscription', user_id, plan_id, "PayPal not configured")
        
        return {
            'success': True,
            'subscription_id': f'sim_sub_{user_id}_{plan_id}',
            'approval_url': 'http://localhost:3000/payment-success',
            'status': 'APPROVED',
            'test_mode': True,
            'note': 'PayPal simulation - no real payment processed'
        }
    
    def _create_simulation_payment(self, plan_id, user_email, user_id):
        """Fallback simulation for one-time payments"""
        log_payment_operation('simulation_payment', user_id, plan_id, "PayPal not configured")
        
        return {
            'success': True,
            'payment_id': f'sim_pay_{user_id}_{plan_id}',
            'approval_url': 'http://localhost:3000/payment-success', 
            'status': 'APPROVED',
            'test_mode': True,
            'note': 'PayPal simulation - no real payment processed'
        }

# Create global instance
paypal_service = PayPalService()