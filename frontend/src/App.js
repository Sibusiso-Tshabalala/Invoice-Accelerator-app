import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceCreator from './components/invoice/InvoiceCreator';

function App() {
  return (
    <Router>
      <div>
        <header style={{
          padding: '20px',
          background: '#3b82f6',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1>Invoice Accelerator</h1>
          <p>Create and send invoices via WhatsApp, SMS, or Email</p>
        </header>

        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Get Started</h2>
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
                  Create Your First Invoice
                </a>
              </div>
            } />
            <Route path="/create" element={<InvoiceCreator />} />
          </Routes>
        </main>

        <footer style={{
          textAlign: 'center',
          padding: '20px',
          background: '#f3f4f6',
          marginTop: '40px'
        }}>
          <p>© 2024 Invoice Accelerator</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;