import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ onSuccess }) => {
  const [amount, setAmount] = useState(99.99);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await fetch('/api/payments/intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            amount,
            currency: 'usd',
            description: 'Knowledge System Subscription'
          })
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError('Failed to initialize payment');
      }
    };

    fetchClientSecret();
  }, [amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe not loaded');
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      if (paymentIntent.status === 'succeeded') {
        onSuccess();
        setProcessing(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Card Details</label>
          <div className="mt-1">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' }
                  },
                  invalid: { color: '#9e2144' }
                }
              }}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={processing}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

const PaymentFormWrapper = ({ onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm onSuccess={onSuccess} />
    </Elements>
  );
};

export default PaymentFormWrapper;
