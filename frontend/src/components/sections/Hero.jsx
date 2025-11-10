import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const Hero = () => {
  const handleGetStarted = () => {
    alert('Getting started! Redirecting to signup...');
  };

  const handleViewDemo = () => {
    alert('Showing demo! Redirecting to demo page...');
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-4xl">
        <motion.h1 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-5xl md:text-7xl font-bold mb-6"
    >
      <span className="text-gradient">Revolutionize</span> Your{' '}
      <span className="text-gradient">South African</span> Invoicing
    </motion.h1>
    
    <motion.p
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8"
    >
      AI-powered invoicing built for South African businesses. Save time, reduce errors, and get paid faster in Rands.
    </motion.p> 

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button variant="primary" className="text-lg px-8 py-4" onClick={handleGetStarted}>
            Get Started Free
          </Button>
          <Button variant="secondary" className="text-lg px-8 py-4" onClick={handleViewDemo}>
            View Live Demo
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;