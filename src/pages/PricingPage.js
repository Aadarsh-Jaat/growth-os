// pages/PricingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Crown, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const { currentUser } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '✓ Up to 10 tasks per day',
        '✓ 5 habits maximum',
        '✓ Basic dashboard',
        '✓ 1 business tracker',
        '✓ Basic analytics',
        '✗ AI Coach',
        '✗ Advanced reports',
        '✗ Data export'
      ],
      cta: currentUser ? 'Current Plan' : 'Get Started',
      popular: false
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: '/month',
      description: 'For serious growth seekers',
      features: [
        '✓ Unlimited tasks',
        '✓ Unlimited habits',
        '✓ Advanced dashboard',
        '✓ All business trackers',
        '✓ Advanced analytics',
        '✓ AI Coach with personalization',
        '✓ Weekly & Monthly reviews',
        '✓ Export data (CSV/PDF)',
        '✓ Priority support'
      ],
      cta: currentUser ? 'Upgrade Now' : 'Start Free Trial',
      popular: true
    },
    {
      name: 'Annual',
      price: '$99',
      period: '/year',
      description: 'Best value - save 17%',
      features: [
        '✓ Everything in Premium',
        '✓ 2 months free',
        '✓ Exclusive webinars',
        '✓ 1-on-1 coaching session',
        '✓ Early access to features'
      ],
      cta: currentUser ? 'Upgrade to Annual' : 'Start Annual Trial',
      popular: false,
      savings: 'Save $20.88'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Growth OS</span>
            </Link>
            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl shadow-lg overflow-hidden ${
                plan.popular
                  ? 'bg-white dark:bg-gray-800 ring-2 ring-blue-500 transform scale-105'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              {plan.savings && (
                <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold">
                  {plan.savings}
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                  {plan.name === 'Premium' && <Crown className="text-yellow-500" size={28} />}
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      {feature.startsWith('✓') ? (
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      ) : feature.startsWith('✗') ? (
                        <div className="w-5 h-5 mr-2" />
                      ) : null}
                      <span className={`text-sm ${
                        feature.startsWith('✓') 
                          ? 'text-gray-700 dark:text-gray-300'
                          : feature.startsWith('✗')
                          ? 'text-gray-400 dark:text-gray-500 line-through'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {feature.replace('✓ ', '').replace('✗ ', '')}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <button
                    disabled={plan.cta === 'Current Plan'}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : plan.cta === 'Current Plan'
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
                
                {plan.name === 'Premium' && (
                  <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                    Cancel anytime. No questions asked.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Can I upgrade later?</h3>
              <p className="text-gray-600 dark:text-gray-400">Yes, you can upgrade from Free to Premium anytime. Your data will be preserved.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-gray-400">Yes, Premium comes with a 14-day free trial. No credit card required.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-400">We accept all major credit cards, PayPal, and UPI for Indian customers.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 dark:text-gray-400">Absolutely. You can cancel your subscription at any time with no hidden fees.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}