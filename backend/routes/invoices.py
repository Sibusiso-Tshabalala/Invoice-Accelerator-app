from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from flask_cors import cross_origin
from datetime import datetime

invoices = Blueprint('invoices', __name__)

# We'll import db and models from app in the routes
def get_db():
    from ..app import db
    return db

def get_models():
    from ..app import Invoice, User
    return Invoice, User

@invoices.route('/')
@login_required
@cross_origin()
def get_user_invoices():
    """Get all invoices for the current user"""
    try:
        Invoice, User = get_models()
        db = get_db()
        
        invoices = Invoice.query.filter_by(user_id=current_user.id).order_by(
            Invoice.created_at.desc()
        ).all()
        
        invoices_data = []
        for invoice in invoices:
            invoices_data.append({
                'id': invoice.id,
                'client_name': invoice.client_name,
                'client_email': invoice.client_email,
                'invoice_amount': invoice.invoice_amount,
                'due_date': invoice.due_date,
                'days_overdue': invoice.days_overdue,
                'status': invoice.status,
                'created_at': invoice.created_at.isoformat()
            })
        
        return jsonify({'success': True, 'invoices': invoices_data})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@invoices.route('/stats')
@login_required
@cross_origin()
def get_invoice_stats():
    """Get basic invoice statistics"""
    try:
        Invoice, User = get_models()
        
        total_invoices = Invoice.query.filter_by(user_id=current_user.id).count()
        pending_count = Invoice.query.filter_by(user_id=current_user.id, status='pending').count()
        sent_count = Invoice.query.filter_by(user_id=current_user.id, status='sent').count()
        paid_count = Invoice.query.filter_by(user_id=current_user.id, status='paid').count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_invoices': total_invoices,
                'pending_count': pending_count,
                'sent_count': sent_count,
                'paid_count': paid_count
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500