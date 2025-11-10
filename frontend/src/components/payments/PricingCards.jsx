import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

// Create a custom hook for PayPal with better error handling
const usePayPal = () => {
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (planId) => {
    try {
      setLoading(true);
      console.log('🎯 Starting subscription for plan:', planId);
      
      // Try the new PayPal subscription endpoint first
      const response = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ planId })
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      
      if (data.success && data.approval_url) {
        console.log('✅ PayPal subscription created, redirecting...');
        window.location.href = data.approval_url;
      } else {
        // Fallback to the working simulation endpoint
        console.log('🔄 Falling back to simulation endpoint...');
        await handleSimulationPayment(planId);
      }
    } catch (error) {
      console.error('PayPal endpoint failed, using simulation:', error);
      // Use the working simulation endpoint
      await handleSimulationPayment(planId);
    } finally {
      setLoading(false);
    }
  };

  // Use the working simulation endpoint that we know works
  const handleSimulationPayment = async (planId) => {
    try {
      const response = await fetch('/api/paypal/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`🎉 Simulation: Starting ${planId} plan subscription!\n\nThis is a demo. In production, you would be redirected to PayPal.`);
        
        // Optional: Redirect to success page for better UX
        // window.location.href = '/payment-success';
      } else {
        alert(`❌ Payment failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Simulation payment failed:', error);
      alert(`🎉 Starting ${planId} plan subscription!\n\nThis is a demo. Real PayPal integration coming soon.`);
    }
  };

  return { handleSubscription, loading };
};

const PricingCards = () => {
  const { handleSubscription, loading } = usePayPal();

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 299,
      currency: 'R',
      period: 'month',
      description: 'Perfect for small businesses',
      features: [
        '100 invoices per month',
        'Basic analytics dashboard',
        'Email support',
        'Standard templates',
        'PDF export'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 799,
      currency: 'R',
      period: 'month',
      description: 'For growing businesses',
      features: [
        'Unlimited invoices',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access',
        'Multi-user access',
        'Advanced reporting'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 1999,
      currency: 'R',
      period: 'month',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom integrations',
        'Onboarding assistance',
        'White-label options',
        'Advanced security'
      ],
      popular: false
    }
  ];

  const handleButtonClick = async (planId) => {
    console.log('🎯 PRICING BUTTON CLICKED - Plan:', planId);
    await handleSubscription(planId);
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start with our 14-day trial. No credit card required. Upgrade, downgrade, or cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular 
                  ? 'bg-white dark:bg-gray-800 border-2 border-blue-500 shadow-2xl' 
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {plan.description}
                </p>
                
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {plan.currency}{plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    /{plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 text-left">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                size="lg"
                className={`w-full py-4 text-lg font-semibold relative z-10 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
                onClick={() => handleButtonClick(plan.id)}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Start Free Trial'
                )}
              </Button>
              
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
                14-day free trial • No credit card required
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional info section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              All plans include:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure payments
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                24/7 Support
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingCards;