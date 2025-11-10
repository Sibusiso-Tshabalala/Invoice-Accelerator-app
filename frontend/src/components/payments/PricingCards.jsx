import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

// Try to import usePayPal, but provide fallback if it fails
<section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900"></section>
let usePayPal;
try {
  usePayPal = require('./PayPalProvider').usePayPal;
} catch (error) {
  console.warn('PayPalProvider not available, using fallback');
  usePayPal = () => ({ 
    handleSubscription: (planId) => {
      console.log('🎯 FALLBACK: Button clicked for plan:', planId);
      alert(`Fallback: Starting subscription for ${planId} plan!`);
    }, 
    loading: false 
  });
}

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

  const handleButtonClick = (planId) => {
    console.log('🎯 PRICING BUTTON CLICKED - Plan:', planId);
    console.log('🔄 handleSubscription function:', handleSubscription);
    handleSubscription(planId);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
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
              whileHover={{ scale: 1.05 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular 
                  ? 'glass border-2 border-blue-500 shadow-2xl' 
                  : 'glass dark:glass-dark'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
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
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                className="w-full py-4 text-lg relative z-10"
                onClick={() => handleButtonClick(plan.id)}
                disabled={loading}
              >
                {loading ? 'Redirecting to PayPal...' : 'Start Free Trial'}
              </Button>
              
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
                14-day free trial • No credit card required
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingCards;