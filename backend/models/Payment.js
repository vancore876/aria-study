const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentIntentId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { 
    type: String, 
    enum: ['succeeded', 'requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'canceled'], 
    required: true 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
