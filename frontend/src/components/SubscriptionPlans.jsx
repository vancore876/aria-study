import React from 'react';
import { useAuth } from '../context/AuthContext';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '✅ Unlimited AI chat (core feature)',
      '✅ Basic explanations & Q&A',
      '✅ Basic note summaries',
      '✅ Limited flashcards (5–10 sets)',
      '✅ Limited quizzes (3–5/week)',
      '✅ Basic study planner',
      '❌ No advanced analytics',
      '❌ No deep personalization'
    ]
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 4.99,
    features: [
      '🚀 Faster & smarter AI responses',
      '♾️ Unlimited flashcards',
      '♾️ Unlimited quizzes',
      '📊 Full progress tracking',
      '⏰ Smart reminders & scheduling',
      '🧠 Better summaries (more detailed)',
      '🚫 No ads'
    ],
    recommended: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    features: [
      '📄 PDF & document analysis',
      '🎯 Personalized study plans',
      '📉 Weak-topic detection',
      '🧪 Advanced exam simulations',
      '🗣️ Voice-based study assistant',
      '⚡ Priority AI (faster + better reasoning)',
      '🧠 Memory across sessions (remembers user goals)'
    ]
  }
];

const SubscriptionPlans = () => {
  const { user, subscribe } = useAuth();

  const handleSubscribe = async (plan) => {
    try {
      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod: 'credit_card'
        })
      });

      const { clientSecret } = await response.json();
      // Handle payment confirmation flow
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
      <p className="text-center text-gray-500 mb-12">Start free. Upgrade when you need more power.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`p-8 rounded-lg shadow-lg ${
              plan.recommended ? 'border-2 border-indigo-500 relative' : 'border border-gray-200'
            }`}
          >
            {plan.recommended && (
              <span className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                RECOMMENDED
              </span>
            )}
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold mb-6">
              {plan.price === 0 ? 'Free' : `$${plan.price}/month`}
            </p>
            <ul className="mb-8 space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            {plan.id === 'free' ? (
              <button
                onClick={() => handleSubscribe(plan)}
                className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Get Started Free
              </button>
            ) : plan.recommended ? (
              <button
                onClick={() => handleSubscribe(plan)}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Upgrade to Plus
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe(plan)}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Go Pro
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
