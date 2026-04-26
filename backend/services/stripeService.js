const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentSheet = async (amount, customerEmail, userId, planId) => {
  try {
    // 1. Create or retrieve a customer
    const customers = await stripe.customers.list({ email: customerEmail });
    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email: customerEmail });
    }

    // 2. Create an Ephemeral Key (required for mobile SDK)
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2022-11-15' }
    );

    // 3. Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId,
        planId: planId
      }
    });

    return {
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    };
  } catch (error) {
    console.error('Stripe Service Error:', error);
    throw error;
  }
};

const handleWebhook = async (payload, sig) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error:`, err.message);
    return false;
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, planId } = paymentIntent.metadata;

    if (userId && planId) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
          process.env.EXPO_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for backend bypass
        );

        const { error } = await supabase
          .from('profiles')
          .update({ subscription_level: planId })
          .eq('id', userId);

        if (error) console.error('Supabase Update Error:', error);
        else console.log(`Successfully upgraded user ${userId} to ${planId}`);
      } catch (err) {
        console.error('Webhook Supabase Integration Error:', err);
      }
    }
  }

  return true;
};

module.exports = { createPaymentSheet, handleWebhook };
