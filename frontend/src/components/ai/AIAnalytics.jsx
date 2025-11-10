import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AIAnalytics = () => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeInvoices = async () => {
    setLoading(true);
    try {
      // Sample invoice data - replace with real data from your backend
      const sampleInvoices = [
        { client: "Client A", amount: 1500, due_date: "2024-01-15", status: "paid", paid_date: "2024-01-10" },
        { client: "Client B", amount: 2500, due_date: "2024-01-20", status: "overdue", days_overdue: 5 },
        { client: "Client C", amount: 1800, due_date: "2024-02-01", status: "pending" },
        { client: "Client D", amount: 3200, due_date: "2024-01-25", status: "paid", paid_date: "2024-01-28" }
      ];

      const response = await axios.post('/api/ai/analyze-invoice', {
        invoices: sampleInvoices
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
      } else {
        alert('Analysis failed: ' + response.data.error);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze invoices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            AI-Powered Insights
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get intelligent analysis of your invoicing patterns and cash flow
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="glass dark:glass-dark p-8 rounded-2xl"
        >
          <div className="text-center mb-8">
            <button
              onClick={analyzeInvoices}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze My Invoicing Patterns'}
            </button>
          </div>

          {analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-700 rounded-lg p-6 mt-6"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                AI Analysis Results
              </h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {analysis}
              </div>
            </motion.div>
          )}

          {!analysis && !loading && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <p>Click the button above to get AI-powered insights about your invoicing patterns,</p>
              <p>payment trends, and cash flow optimization opportunities.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default AIAnalytics;