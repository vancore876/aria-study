import { initStripe } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51TPxmPEyIBsVzuMAIvkEMcoae0eq6AMd7kKX0sLHnDNprlwnVZrRaQn9U6pTsfoBlsD4ScR0PqYnLuqot1qoeOzE00ulH6ffRp';

export const StripeService = {
  async initialize() {
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
    });
  },

  async createPaymentSheet(planId: string, email: string, userId: string) {
    try {
      // Use your backend URL. If running locally, use your IP address like http://192.168.1.XX:5000
      const response = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          email,
          userId,
        }),
      });

      const { paymentIntent, ephemeralKey, customer } = await response.json();

      return {
        paymentIntent,
        ephemeralKey,
        customer,
      };
    } catch (error) {
      console.error('Error fetching payment sheet params:', error);
      throw error;
    }
  },
};
