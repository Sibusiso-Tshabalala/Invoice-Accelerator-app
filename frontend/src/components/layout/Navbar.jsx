import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  const handleNavigation = (page) => {
    // For now, show alerts. We'll add proper routing next.
    switch(page) {
      case 'features':
        window.location.href = '/#features';
        break;
      case 'pricing':
        window.location.href = '/#pricing';
        break;
      case 'about':
        alert('Navigating to About page');
        break;
      case 'contact':
        alert('Navigating to Contact page');
        break;
      default:
        break;
    }
  };

  const handleGetStarted = () => {
    alert('Getting started! Redirecting to signup...');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass dark:glass-dark sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-gradient cursor-pointer"
            onClick={() => window.location.href = '/'}
          >
            InvoiceAccelerator
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {[
              { name: 'Features', id: 'features' },
              { name: 'Pricing', id: 'pricing' },
              { name: 'About', id: 'about' },
              { name: 'Contact', id: 'contact' }
            ].map((item) => (
              <motion.a
                key={item.name}
                whileHover={{ scale: 1.1 }}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
                onClick={() => handleNavigation(item.id)}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Theme Toggle & CTA */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg glass dark:glass-dark"
            >
              {isDark ? '🌙' : '☀️'}
            </button>
            <Button onClick={handleGetStarted}>Get Started</Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;