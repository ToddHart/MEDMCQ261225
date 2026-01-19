import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useTenant } from '../contexts/TenantContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const { tenant, getPrimaryColor } = useTenant();
  
  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';
  const supportEmail = tenant?.support_email || 'support@medmcq.com.au';
  const footerAddress = tenant?.footer_address || '2/24 Edgar St, Coffs Harbour NSW 2450, Australia';
  const primaryColor = getPrimaryColor();
  
  // Update page title
  useEffect(() => {
    document.title = `Contact | ${tenantName}`;
  }, [tenantName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/contact`, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'Contact Form Submission',
        message: formData.message
      });
      
      setResult({ success: true, message: response.data.message });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setResult({ 
        success: false, 
        message: error.response?.data?.detail || 'Failed to send message. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          {result && (
            <div className={`mb-6 p-4 rounded-lg ${
              result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {result.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="What is this about?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Other Ways to Reach Us</h2>
          <div className="space-y-3">
            <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline">{supportEmail}</a></p>
            {footerAddress && <p><strong>Address:</strong> {footerAddress}</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
