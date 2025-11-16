import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="pt-20 min-h-screen">
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              About InvoiceAccelerator
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Revolutionizing how businesses manage their invoicing and payments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass dark:glass-dark p-8 rounded-2xl"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We're on a mission to simplify invoice management for businesses of all sizes. 
                Our AI-powered platform helps you get paid faster, reduce administrative work, 
                and focus on what matters most - growing your business.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass dark:glass-dark p-8 rounded-2xl"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose Us</h2>
              <ul className="text-gray-600 dark:text-gray-300 space-y-3">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  AI-powered payment reminders
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Advanced analytics and insights
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Secure payment processing
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Easy-to-use interface
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;