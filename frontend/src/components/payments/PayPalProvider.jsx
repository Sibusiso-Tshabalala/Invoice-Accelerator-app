import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const PayPalContext = createContext();

export const usePayPal = () => {
  const context = useContext(PayPalContext);
  if (!context) {
    throw new Error('usePayPal must be used within a PayPalProvider');
  }
  return context;
};

export const PayPalProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (planId) => {
    setLoading(true);
    console.log('🔄 Starting payment process for plan:', planId);
    
    try {
      // First test the connection
      console.log('🔗 Testing connection to backend...');
      const testResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Backend connection successful:', testResponse.data);

      // Then try to create payment
      console.log('💳 Creating payment session...');
      const response = await axios.post('http://localhost:5000/api/paypal/create-payment', {
        planId: planId
      });

      console.log('✅ Payment session created:', response.data);

      if (response.data.success) {
        // Redirect to PayPal approval page
        console.log('🔗 Redirecting to PayPal...');
        window.location.href = response.data.approvalUrl;
      } else {
        throw new Error(response.data.error || 'Payment failed');
      }
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Payment failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    handleSubscription,
    loading
  };

  return (
    <PayPalContext.Provider value={value}>
      {children}
    </PayPalContext.Provider>
  );
};
