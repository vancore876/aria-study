const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { planId, email, userId } = req.body;
    
    // Determine amount based on plan
    let amount = 0;
    if (planId === 'pro') amount = 999; // $9.99
    if (planId === 'college') amount = 1999; // $19.99

    if (amount === 0) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const paymentParams = await stripeService.createPaymentSheet(amount, email, userId, planId);
    res.json(paymentParams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const success = await stripeService.handleWebhook(req.body, sig);
  res.status(success ? 200 : 400).send();
});

router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('subscription');
    res.json(user.subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
