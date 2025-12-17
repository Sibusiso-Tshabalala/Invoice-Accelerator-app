// frontend/src/components/layout/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      background: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          InvoiceAccelerator
        </Link>
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/create" style={{
          background: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          textDecoration: 'none'
        }}>
          Create Invoice
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;