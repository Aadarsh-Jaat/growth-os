// pages/LandingPage.js (Complete)
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Target, 
  TrendingUp, 
  Bot, 
  Shield, 
  Crown,
  CheckCircle,
  ArrowRight,
  Sun,
  Moon,
  Dumbbell,
  Briefcase,
  Code,
  Languages,
  Truck,
  Gift,
  BarChart3,
  Zap,
  Calendar,
  DollarSign,
  Users,
  Star
} from 'lucide-react';

export default function LandingPage() {
  const { currentUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const features = [
    { icon: Target, title: 'Life Management', description: 'Track fitness, career, business, and personal growth all in one place' },
    { icon: TrendingUp, title: 'Wealth Tracking', description: 'Monitor savings, investments, and work toward your ₹10-15 crore goal' },
    { icon: Bot, title: 'AI Coach', description: 'Get personalized advice and motivation based on your data' },
    { icon: Shield, title: 'Privacy First', description: 'Your data is secure and only accessible by you' },
    { icon: Dumbbell, title: 'Fitness Tracker', description: 'Log workouts, track progress, and build lasting habits' },
    { icon: Languages, title: 'IELTS Prep', description: 'Track English learning with AI-generated speaking topics' },
    { icon: Briefcase, title: 'Career Hub', description: 'Manage job applications, skills, and interview prep' },
    { icon: Truck, title: 'Business Tools', description: 'Run Wildcore and Transport business from one dashboard' }
  ];

  const plans = [
    { 
      name: 'Free', 
      price: '$0', 
      period: 'forever',
      features: [
        'Basic task management (10 tasks/day)',
        '5 habits max',
        'Basic dashboard',
        '1 business tracker',
        'No AI coach',
        'Basic reports'
      ], 
      button: 'Get Started', 
      popular: false 
    },
    { 
      name: 'Premium', 
      price: '$9.99', 
      period: '/month',
      features: [
        'Unlimited tasks',
        'Unlimited habits',
        'AI Coach with personalized advice',
        'All business trackers (Wildcore + Transport)',
        'Advanced analytics & reports',
        'Export data (CSV/PDF)',
        'Priority support',
        'Weekly & Monthly reviews',
        'Investment tracking'
      ], 
      button: 'Start Free Trial', 
      popular: true 
    },
    { 
      name: 'Family', 
      price: '$19.99', 
      period: '/month',
      features: [
        'Everything in Premium',
        '5 user accounts',
        'Family goals dashboard',
        'Shared business tracking',
        'Team collaboration'
      ], 
      button: 'Contact Sales', 
      popular: false 
    }
  ];

  const testimonials = [
    { name: 'Rajesh K.', role: 'Entrepreneur', content: 'Growth OS transformed how I manage my day. I went from chaos to complete control over my businesses and personal growth.', rating: 5 },
    { name: 'Priya M.', role: 'Job Seeker', content: 'The AI coach helped me stay consistent with my interview prep. Landed my dream job in 3 months!', rating: 5 },
    { name: 'Amit S.', role: 'Fitness Enthusiast', content: 'Tracking habits and workouts has never been easier. Lost 15 kgs using this app!', rating: 4 }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Growth OS
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Pricing</a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Testimonials</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
              </button>
              
              {currentUser ? (
                <Link
                  to="/app/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm mb-6">
            <Zap size={14} className="mr-1" />
            Your Personal Operating System for Success
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Take Control of Your Life
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Track fitness, career, business, English learning, wealth, and personal growth in one powerful platform.
            Like a CEO dashboard for your life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!currentUser && (
              <Link
                to="/signup"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-lg"
              >
                Start Your Journey <ArrowRight size={20} />
              </Link>
            )}
            <Link
              to="#features"
              className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 transition text-gray-700 dark:text-gray-300"
            >
              Explore Features
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">10+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Life Areas Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AI Coach Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">₹10Cr+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Wealth Goal Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Data Privacy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From daily habits to long-term wealth goals, Growth OS has you covered
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Powerful Dashboard at Your Fingertips
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Get a complete overview of your progress with beautiful charts, streaks, and AI-powered insights.
                Know exactly where you stand in every area of your life.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time progress tracking',
                  'Habit streaks and achievements',
                  'Weekly performance scores',
                  'AI suggestions tailored to you'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle size={18} className="text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">85%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                  </div>
                </div>
                <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <BarChart3 size={48} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free, upgrade when you're ready to accelerate your growth
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500 transform md:-translate-y-2' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={currentUser ? "/app/dashboard" : "/signup"}
                    className={`block text-center py-3 rounded-lg font-semibold transition ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {plan.button}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Growth Seekers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands who are transforming their lives with Growth OS
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Take Control of Your Life?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join Growth OS today and start your journey toward the best version of yourself.
          </p>
          {!currentUser && (
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Start Your Free Trial <ArrowRight size={20} />
            </Link>
          )}
          <p className="text-white/80 text-sm mt-4">No credit card required. Free forever plan available.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-lg font-bold">Growth OS</span>
              </div>
              <p className="text-gray-400 text-sm">Your personal operating system for success and growth.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
                <li><Link to="/signup" className="hover:text-white transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Growth OS. All rights reserved. Designed to help you become the best version of yourself.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}