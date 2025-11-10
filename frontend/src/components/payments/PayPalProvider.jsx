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
  const [isProcessing, setIsProcessing] = useState(false);

  const createSubscription = async (planId) => {
    try {
      setIsProcessing(true);
      
      const response = await axios.post('/api/paypal/create-subscription', {
        planId: planId
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        // Redirect to PayPal approval URL
        window.location.href = response.data.approval_url;
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('PayPal subscription error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const createOneTimePayment = async (planId) => {
    try {
      setIsProcessing(true);
      
      const response = await axios.post('/api/paypal/create-payment', {
        planId: planId
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        // Redirect to PayPal approval URL
        window.location.href = response.data.approval_url;
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const executePayment = async (paymentId, payerId) => {
    try {
      const response = await axios.post('/api/paypal/execute-payment', {
        paymentId: paymentId,
        payerId: payerId
      }, {
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('PayPal execution error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  };

  const value = {
    createSubscription,
    createOneTimePayment,
    executePayment,
    isProcessing
  };

  return (
    <PayPalContext.Provider value={value}>
      {children}
    </PayPalContext.Provider>
  );
};

export default PayPalProvider;