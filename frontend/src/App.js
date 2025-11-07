import React from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import CTA from './components/sections/CTA';
import Footer from './components/layout/Footer';
import './index.css';

function AppContent() {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;