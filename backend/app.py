# backend/app.py (SIMPLIFIED)
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Simple database (replace with real DB later)
invoices = []

@app.route('/api/create-invoice', methods=['POST'])
def create_invoice():
    data = request.json
    
    # Generate invoice number
    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{len(invoices)+1}"
    
    # Create invoice object
    invoice = {
        'id': invoice_number,
        'business_name': data.get('businessName'),
        'client_name': data.get('clientName'),
        'amount': data.get('amount'),
        'due_date': data.get('dueDate'),
        'tone': data.get('tone', 'professional'),
        'channel': data.get('channel', 'whatsapp'),
        'created_at': datetime.now().isoformat(),
        'status': 'sent'
    }
    
    invoices.append(invoice)
    
    # TODO: Actually send via chosen channel
    # For now, just log
    print(f"Would send {invoice_number} via {invoice['channel']} with {invoice['tone']} tone")
    
    return jsonify({
        'success': True,
        'invoice_id': invoice_number,
        'message': 'Invoice created successfully',
        'payment_instructions': {
            'bank': 'Standard Bank',
            'account_number': '0123456789',
            'branch_code': '123456',
            'reference': invoice_number,
            'email': 'payments@invoiceaccelerator.co.za'
        }
    })

@app.route('/api/send-reminder', methods=['POST'])
def send_reminder():
    data = request.json
    invoice_id = data.get('invoice_id')
    
    # Find invoice
    invoice = next((i for i in invoices if i['id'] == invoice_id), None)
    
    if not invoice:
        return jsonify({'success': False, 'error': 'Invoice not found'}), 404
    
    # TODO: Send reminder via chosen channel
    print(f"Would send reminder for {invoice_id} via {invoice['channel']}")
    
    return jsonify({'success': True, 'message': 'Reminder sent'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)