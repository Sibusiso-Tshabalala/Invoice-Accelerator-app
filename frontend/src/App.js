// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceCreator from './components/invoice/InvoiceCreator';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header style={{ padding: '20px', background: '#3b82f6', color: 'white' }}>
          <h1>Invoice Accelerator</h1>
        </header>
        
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <Routes>
            <Route path="/" element={
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h2>Create and Send Invoices</h2>
                <p>WhatsApp • SMS • Email</p>
                <a 
                  href="/create" 
                  style={{
                    display: 'inline-block',
                    background: '#10b981',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    marginTop: '20px'
                  }}
                >
                  Create Invoice
                </a>
              </div>
            } />
            <Route path="/create" element={<InvoiceCreator />} />
          </Routes>
        </main>
        
        <footer style={{ textAlign: 'center', padding: '20px', background: '#f3f4f6', marginTop: '40px' }}>
          <p>Invoice Accelerator © 2024</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;