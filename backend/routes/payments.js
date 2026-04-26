const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const { authMiddleware, isAdminOrSelf } = require('../middleware');

// Create payment intent
router.post('/intent', [authMiddleware, isAdminOrSelf], async (req, res) => {
  try {
    const { amount, currency, description } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      description,
      payment_method_types: ['card'],
      metadata: { userId: req.userId }
    });
    
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const payment = new Payment({
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      userId: paymentIntent.metadata.userId
    });
    
    await payment.save();
    
    // Update subscription status if applicable
    const subscription = await Subscription.findOne({ paymentIntentId: paymentIntent.id });
    if (subscription) {
      subscription.status = 'active';
      await subscription.save();
    }
  }
  
  res.json({ received: true });
});

// Get payment history
router.get('/', [authMiddleware, isAdminOrSelf], async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
