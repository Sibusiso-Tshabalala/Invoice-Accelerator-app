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
    console.log('🎯 PAYPAL PROVIDER - handleSubscription called with plan:', planId);
    setLoading(true);
    
    try {
      // Test 1: Simple endpoint (no CORS issues)
      console.log('🔗 Testing simple endpoint...');
      const simpleResponse = await axios.post('http://localhost:5000/api/simple-payment', {
        planId: planId,
        test: 'frontend data'
      });
      console.log('✅ Simple endpoint successful:', simpleResponse.data);

      // Test 2: PayPal endpoint
      console.log('🔗 Testing PayPal endpoint...');
      const paypalResponse = await axios.post('http://localhost:5000/api/paypal/create-payment', {
        planId: planId
      });
      console.log('✅ PayPal endpoint successful:', paypalResponse.data);

      // If both work, show success
      alert(`✅ Both endpoints working! Plan: ${planId}`);
      
    } catch (error) {
      console.error('❌ REQUEST FAILED:');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 500) {
        alert('❌ Server 500 Error - Check backend console for details');
      } else {
        alert(`Request failed: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    handleSubscription,
    loading
  };

  console.log('🔄 PayPalProvider initialized');
  
  return (
    <PayPalContext.Provider value={value}>
      {children}
    </PayPalContext.Provider>
  );
};