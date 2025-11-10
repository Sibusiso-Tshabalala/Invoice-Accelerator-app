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
    console.log('🎯 Starting subscription for plan:', planId);
    setLoading(true);
    
    try {
      console.log('🔗 Calling simulated PayPal endpoint...');
      const response = await axios.post('http://localhost:5000/api/paypal/create-payment', {
        planId: planId
      });
      
      console.log('✅ SUCCESS! Response:', response.data);
      
      // Show success message
      alert(`🎉 SUCCESS! ${planId.toUpperCase()} plan activated!\n\nYou now have access to all features!`);
      
    } catch (error) {
      console.error('❌ Payment failed:', error);
      
      // Show the actual error from backend
      if (error.response?.data?.error) {
        alert(`❌ Backend Error: ${error.response.data.error}`);
      } else {
        alert('❌ Payment failed. Check console for details.');
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