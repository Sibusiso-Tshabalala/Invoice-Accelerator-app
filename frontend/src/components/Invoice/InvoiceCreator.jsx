import React, { useState } from 'react';

const InvoiceCreator = () => {
  const [form, setForm] = useState({
    businessName: '',
    clientName: '',
    amount: '',
    whatsapp: '',
    email: '',
    dueDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Invoice would be sent!');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Create Invoice</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          placeholder="Your Business Name"
          value={form.businessName}
          onChange={e => setForm({...form, businessName: e.target.value})}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <input
          placeholder="Client Name"
          value={form.clientName}
          onChange={e => setForm({...form, clientName: e.target.value})}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <input
          placeholder="Amount (R)"
          type="number"
          value={form.amount}
          onChange={e => setForm({...form, amount: e.target.value})}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <input
          placeholder="WhatsApp Number"
          value={form.whatsapp}
          onChange={e => setForm({...form, whatsapp: e.target.value})}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <input
          type="date"
          value={form.dueDate}
          onChange={e => setForm({...form, dueDate: e.target.value})}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <button type="submit" style={{
          padding: '12px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Send Invoice
        </button>
      </form>
    </div>
  );
};

export default InvoiceCreator;