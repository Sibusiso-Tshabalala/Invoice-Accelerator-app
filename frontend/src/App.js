import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import InvoiceCreator from './components/invoice/InvoiceCreator';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Get Paid Faster in South Africa
                </h1>
                <p className="text-gray-600 mb-8">
                  Create invoices and send payment reminders via WhatsApp, SMS, or Email
                </p>
                <a 
                  href="/create" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Create Your First Invoice
                </a>
              </div>
            } />
            <Route path="/create" element={<InvoiceCreator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;