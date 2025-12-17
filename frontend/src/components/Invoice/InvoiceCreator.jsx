import React, { useState } from 'react';

const InvoiceCreator = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    clientName: '',
    clientEmail: '',
    clientWhatsapp: '',
    amount: '',
    dueDate: '',
    description: 'Invoice for services rendered',
  });
  
  const [tone, setTone] = useState('professional'); // friendly, professional, urgent
  const [channel, setChannel] = useState('whatsapp'); // whatsapp, sms, email

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send to backend
    const response = await fetch('/api/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, tone, channel })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Invoice sent successfully!');
      // Show payment instructions
      showPaymentInstructions();
    }
  };

  const showPaymentInstructions = () => {
    return (
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-bold text-green-800 mb-2">Payment Instructions</h3>
        <p className="text-green-700">
          Please make payment to:<br/>
          <strong>Bank: Standard Bank</strong><br/>
          <strong>Account: 0123456789</strong><br/>
          <strong>Branch: 123456</strong><br/>
          <strong>Reference: INV-{Date.now()}</strong><br/>
          <br/>
          Send proof of payment to: payments@yourbusiness.co.za
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create and Send Invoice</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Business Info */}
        <div>
          <label className="block mb-2">Your Business Name</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Client Name</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Amount (R)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Contact Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2">WhatsApp Number</label>
            <input
              type="tel"
              placeholder="+27 12 345 6789"
              value={formData.clientWhatsapp}
              onChange={(e) => setFormData({...formData, clientWhatsapp: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="block mb-2">Reminder Tone</label>
          <div className="flex space-x-4">
            {['friendly', 'professional', 'urgent'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`px-4 py-2 rounded ${
                  tone === t ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Channel Selection */}
        <div>
          <label className="block mb-2">Send Via</label>
          <div className="flex space-x-4">
            {['whatsapp', 'sms', 'email'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`px-4 py-2 rounded ${
                  channel === c ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Send Invoice & Payment Instructions
        </button>
      </form>
    </div>
  );
};

export default InvoiceCreator;