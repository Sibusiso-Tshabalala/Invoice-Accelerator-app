import React, { createContext, useContext, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const StripeContext = createContext();

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (planId) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/payments/create-checkout-session', {
        planId: planId
      });

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.checkoutUrl.split('/').pop()
      });

      if (error) {
        console.error('Stripe error:', error);
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    handleSubscription,
    loading
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};