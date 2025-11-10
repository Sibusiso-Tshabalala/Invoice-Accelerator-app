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
      // Test 1: Basic connection to backend
      console.log('🔗 Step 1: Testing backend connection...');
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Backend connection successful:', healthResponse.data);

      // Test 2: Check PayPal endpoint
      console.log('🔗 Step 2: Testing PayPal endpoint...');
      const plansResponse = await axios.get('http://localhost:5000/api/paypal/plans');
      console.log('✅ PayPal plans endpoint successful:', plansResponse.data);

      // Test 3: Create payment
      console.log('💳 Step 3: Creating payment session for plan:', planId);
      const paymentResponse = await axios.post(
        'http://localhost:5000/api/paypal/create-payment', 
        { planId: planId }
      );
      
      console.log('✅ Payment session created:', paymentResponse.data);

      if (paymentResponse.data.success) {
        console.log('🔗 Redirecting to PayPal...');
        window.location.href = paymentResponse.data.approvalUrl;
      } else {
        throw new Error(paymentResponse.data.error || 'Payment creation failed');
      }
      
    } catch (error) {
      console.error('❌ PAYMENT PROCESS FAILED:');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        alert('❌ Cannot connect to the server. Make sure backend is running on http://localhost:5000');
      } else if (error.response?.status === 404) {
        alert('❌ Backend endpoint not found (404). Check if PayPal routes are registered.');
      } else if (error.response?.status === 500) {
        alert('❌ Server error. Check backend console.');
      } else {
        alert(`❌ Payment failed: ${error.response?.data?.error || error.message}`);
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