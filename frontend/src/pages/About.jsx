import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">About InvoiceAccelerator</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Revolutionizing business invoicing with AI-powered automation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass dark:glass-dark p-8 rounded-2xl mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            We believe that managing invoices shouldn't be a time-consuming chore. 
            InvoiceAccelerator was born from the frustration of manual invoicing processes 
            that take valuable time away from growing your business.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass dark:glass-dark p-8 rounded-2xl"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">What We Offer</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            From AI-powered email generation to automated payment reminders, 
            we provide everything you need to streamline your invoicing process 
            and get paid faster.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;