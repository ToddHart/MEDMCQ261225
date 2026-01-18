import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTenant } from '../contexts/TenantContext';
import api from '../api/axios';

const SubscriptionPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const { tenant } = useTenant();
  
  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';
  
  // Update page title
  useEffect(() => {
    document.title = `Subscription | ${tenantName}`;
  }, [tenantName]);

  // AI limits and features based on subscription tier
  const plans = [
    {
      id: 'weekly',
      name: 'Weekly',
      price: '$9.99',
      priceValue: 9.99,
      period: 'per week',
      features: [
        { text: '200 Questions/day', included: true },
        { text: 'Basic Analytics', included: true },
        { text: 'Exam Mode', included: true },
        { text: 'Question Import (200/week)', included: true },
        { text: 'AI Question Generation', included: false },
        { text: 'Private Storage', included: false },
        { text: 'Study Calendar', included: false },
        { text: 'Progress Reports', included: false },
      ],
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$29.99',
      priceValue: 29.99,
      period: 'per month',
      popular: true,
      features: [
        { text: '500 Questions/day', included: true },
        { text: 'Basic & Advanced Analytics', included: true },
        { text: 'Exam Mode', included: true },
        { text: 'Question Import (500/week)', included: true },
        { text: 'AI Generation (5 uses/day)', included: true, highlight: true },
        { text: '250MB Private Storage', included: true, highlight: true },
        { text: 'Study Calendar', included: true },
        { text: 'Progress Reports', included: true },
      ],
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      price: '$79.99',
      priceValue: 79.99,
      period: 'every 3 months',
      savings: '11% OFF',
      features: [
        { text: 'Unlimited Questions/day', included: true },
        { text: 'Full Analytics Suite', included: true },
        { text: 'Exam Mode + Custom Exams', included: true },
        { text: 'Question Import (1000/week)', included: true },
        { text: 'AI Generation (10 uses/day)', included: true, highlight: true },
        { text: '500MB Private Storage', included: true, highlight: true },
        { text: 'Study Calendar & Tracking', included: true },
        { text: 'Detailed Progress Reports', included: true },
        { text: 'Priority Email Support', included: true },
      ],
    },
    {
      id: 'annual',
      name: 'Annual',
      price: '$249.99',
      priceValue: 249.99,
      period: 'per year',
      savings: '30% OFF',
      bestValue: true,
      features: [
        { text: 'Unlimited Questions/day', included: true },
        { text: 'Full Analytics Suite', included: true },
        { text: 'Unlimited Exam Mode', included: true },
        { text: 'Question Import (2500/week)', included: true },
        { text: 'AI Generation (10 uses/day)', included: true, highlight: true },
        { text: '1GB Private Storage', included: true, highlight: true },
        { text: 'Advanced AI Features', included: true, highlight: true },
        { text: 'Study Calendar & Insights', included: true },
        { text: 'Priority Support 24/7', included: true },
      ],
    },
  ];

  // Check for return from Stripe
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const status = searchParams.get('status');
    
    if (sessionId && status === 'success') {
      pollPaymentStatus(sessionId);
    } else if (status === 'cancelled') {
      setPaymentStatus({ type: 'cancelled', message: 'Payment was cancelled. You can try again when ready.' });
    }
    
    // Load user subscription
    loadSubscription();
  }, [searchParams]);

  const loadSubscription = async () => {
    try {
      const response = await api.get('/user/subscription');
      setSubscription(response.data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setPaymentStatus({ type: 'error', message: 'Payment status check timed out. Please check your email for confirmation.' });
      return;
    }

    try {
      const response = await api.get(`/payments/status/${sessionId}`);
      const data = response.data;

      if (data.payment_status === 'paid') {
        setPaymentStatus({ type: 'success', message: 'Payment successful! Your subscription is now active.' });
        loadSubscription();
        return;
      } else if (data.status === 'expired') {
        setPaymentStatus({ type: 'error', message: 'Payment session expired. Please try again.' });
        return;
      }

      // Continue polling
      setPaymentStatus({ type: 'pending', message: 'Processing payment...' });
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus({ type: 'error', message: 'Error checking payment status.' });
    }
  };

  const handleSubscribe = async (planId) => {
    setLoading(true);
    setProcessingPlan(planId);
    
    try {
      const response = await api.post(`/payments/create-checkout?package_id=${planId}`);
      const data = response.data;
      
      if (data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.detail || 'Failed to create checkout session. Please try again.');
      setLoading(false);
      setProcessingPlan(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Payment Status Banner */}
        {paymentStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            paymentStatus.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' :
            paymentStatus.type === 'error' ? 'bg-red-100 border border-red-400 text-red-800' :
            paymentStatus.type === 'cancelled' ? 'bg-yellow-100 border border-yellow-400 text-yellow-800' :
            'bg-blue-100 border border-blue-400 text-blue-800'
          }`}>
            <div className="flex items-center">
              {paymentStatus.type === 'success' && <span className="text-2xl mr-3">✓</span>}
              {paymentStatus.type === 'error' && <span className="text-2xl mr-3">✗</span>}
              {paymentStatus.type === 'pending' && <span className="text-2xl mr-3 animate-spin">⟳</span>}
              {paymentStatus.type === 'cancelled' && <span className="text-2xl mr-3">⚠</span>}
              <span className="font-medium">{paymentStatus.message}</span>
            </div>
          </div>
        )}

        {/* Payments Disabled Notice */}
        {subscription?.payments_disabled && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠</span>
              <span className="font-medium">Payment system is temporarily disabled. Please check back later or contact support.</span>
            </div>
          </div>
        )}

        {/* Current Subscription Status */}
        {subscription && (subscription.subscription_status === 'active' || subscription.subscription_status === 'free_grant') && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Active Subscription</h3>
                <p className="text-green-100">
                  {subscription.subscription_plan?.charAt(0).toUpperCase() + subscription.subscription_plan?.slice(1)} Plan
                  {subscription.subscription_status === 'free_grant' && ' (Free Grant)'}
                  {subscription.subscription_end && ` • Expires: ${new Date(subscription.subscription_end).toLocaleDateString()}`}
                </p>
              </div>
              <span className="text-4xl">✓</span>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Unlock your full learning potential with {tenantName}</p>
          <p className="text-sm text-gray-500 mt-2">All prices in AUD • Secure payment via Stripe</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl ${
                plan.popular ? 'ring-4 ring-blue-500 transform scale-105' : 'border border-gray-200'
              }`}
            >
              {/* Plan Header */}
              <div className={`p-6 ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-50'}`}>
                {plan.popular && (
                  <div className="text-center mb-2">
                    <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                {plan.bestValue && (
                  <div className="text-center mb-2">
                    <span className="bg-green-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
                      BEST VALUE
                    </span>
                  </div>
                )}
                <h3 className={`text-2xl font-bold text-center mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                {plan.savings && (
                  <div className="text-center mb-2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {plan.savings}
                    </span>
                  </div>
                )}
                <div className={`text-center ${plan.popular ? 'text-white' : ''}`}>
                  <div className="text-4xl font-bold mb-1">{plan.price}</div>
                  <div className="text-sm opacity-80">{plan.period}</div>
                </div>
              </div>

              {/* Features List */}
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                        feature.included 
                          ? feature.highlight 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-green-500 text-white'
                          : 'bg-gray-300'
                      }`}>
                        {feature.included ? '✓' : '✗'}
                      </span>
                      <span className={`text-sm ${
                        feature.included 
                          ? feature.highlight 
                            ? 'font-semibold text-purple-700' 
                            : 'text-gray-700'
                          : 'text-gray-400 line-through'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || subscription?.payments_disabled || (subscription?.subscription_status === 'active' && subscription?.subscription_plan === plan.id)}
                  className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center ${
                    subscription?.subscription_status === 'active' && subscription?.subscription_plan === plan.id
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg disabled:opacity-50'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50'
                  }`}
                >
                  {processingPlan === plan.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : subscription?.subscription_status === 'active' && subscription?.subscription_plan === plan.id ? (
                    '✓ Current Plan'
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Subscribe Now
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Detailed Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Weekly</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Monthly</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Quarterly</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Annual</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Questions/Day</td>
                  <td className="text-center py-3 px-4">200</td>
                  <td className="text-center py-3 px-4">500</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Question Import/Week</td>
                  <td className="text-center py-3 px-4">200</td>
                  <td className="text-center py-3 px-4">500</td>
                  <td className="text-center py-3 px-4">1000</td>
                  <td className="text-center py-3 px-4">2500</td>
                </tr>
                <tr className="border-b border-gray-100 bg-purple-50">
                  <td className="py-3 px-4 font-bold">AI Question Generation</td>
                  <td className="text-center py-3 px-4 text-gray-400">✗ None</td>
                  <td className="text-center py-3 px-4 font-semibold text-purple-700">5/day</td>
                  <td className="text-center py-3 px-4 font-semibold text-purple-700">10/day</td>
                  <td className="text-center py-3 px-4 font-semibold text-purple-700">10/day</td>
                </tr>
                <tr className="border-b border-gray-100 bg-purple-50">
                  <td className="py-3 px-4 font-bold">Private Storage</td>
                  <td className="text-center py-3 px-4 text-gray-400">✗ None</td>
                  <td className="text-center py-3 px-4 font-semibold text-purple-700">250MB</td>
                  <td className="text-center py-3 px-4 font-semibold text-purple-700">500MB</td>
                  <td className="text-center py-3 px-4 font-semibold text-purple-700">1GB</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Analytics</td>
                  <td className="text-center py-3 px-4">Basic</td>
                  <td className="text-center py-3 px-4">Advanced</td>
                  <td className="text-center py-3 px-4">Full Suite</td>
                  <td className="text-center py-3 px-4">Full Suite</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Study Calendar</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Support</td>
                  <td className="text-center py-3 px-4">Email</td>
                  <td className="text-center py-3 px-4">Email</td>
                  <td className="text-center py-3 px-4">Priority</td>
                  <td className="text-center py-3 px-4">24/7 Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-gray-100 px-6 py-3 rounded-full">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-gray-700 font-medium">Secure payment powered by Stripe</span>
          </div>
        </div>

        {/* Enterprise Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl p-8 text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Enterprise & Institutional Plans</h2>
          <p className="text-lg mb-6 text-gray-300">
            Medical schools, hospitals, and institutions can contact us for customized plans with team features.
          </p>
          <button
            onClick={() => window.location.href = '/contact'}
            className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
          >
            Contact for Enterprise Plan
          </button>
        </div>

        {/* Company Info */}
        <div className="text-center text-gray-500 text-sm">
          <p className="font-semibold">ABUNDITA INVESTMENTS PTY LTD</p>
          <p>ABN: 55 100 379 299</p>
          <p>2/24 Edgar St, Coffs Harbour NSW 2450, Australia</p>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
