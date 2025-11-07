import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const CTA = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="glass dark:glass-dark p-12 rounded-3xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Ready to Transform Your Invoicing?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of businesses already using InvoiceAccelerator
          </p>
          <Button variant="primary" className="text-lg px-10 py-4">
            Get Started Today
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;