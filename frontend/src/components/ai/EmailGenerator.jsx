import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const EmailGenerator = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    invoiceAmount: '',
    dueDate: '',
    daysOverdue: '7',
    tone: 'professional'
  });
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateEmail = async () => {
    if (!formData.clientName || !formData.invoiceAmount) {
      setError('Client name and amount are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/ai/generate-email', {
        client_name: formData.clientName,
        invoice_amount: formData.invoiceAmount,
        due_date: formData.dueDate,
        days_overdue: formData.daysOverdue,
        tone: formData.tone
      });

      if (response.data.success) {
        setGeneratedEmail(response.data.email);
      } else {
        setError(response.data.error || 'Failed to generate email');
      }
    } catch (err) {
      setError('Failed to connect to AI service. Please try again.');
      console.error('Email generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    alert('Email copied to clipboard!');
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            AI Email Generator
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Let our AI write professional payment reminders in seconds
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="glass dark:glass-dark p-8 rounded-2xl"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Email Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Amount *
                </label>
                <input
                  type="number"
                  name="invoiceAmount"
                  value={formData.invoiceAmount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Days Overdue
                </label>
                <select
                  name="daysOverdue"
                  value={formData.daysOverdue}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="15">15 days</option>
                  <option value="30">30+ days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Tone
                </label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="firm">Firm</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button
                onClick={generateEmail}
                disabled={loading || !formData.clientName || !formData.invoiceAmount}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Email'}
              </button>

              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
            </div>
          </motion.div>

          {/* Generated Email */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="glass dark:glass-dark p-8 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Generated Email
              </h3>
              {generatedEmail && (
                <button
                  onClick={copyToClipboard}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Copy
                </button>
              )}
            </div>

            {generatedEmail ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-sans">
                  {generatedEmail}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  Your AI-generated email will appear here
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EmailGenerator;