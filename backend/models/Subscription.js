const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: String, enum: ['free', 'plus', 'pro'], required: true },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer', 'none'], default: 'none' },
  stripeSubscriptionId: { type: String },
  nextBillingDate: { type: Date },
  price: { type: Number, default: 0 },
  features: {
    unlimitedChat: { type: Boolean, default: true },
    unlimitedFlashcards: { type: Boolean, default: false },
    unlimitedQuizzes: { type: Boolean, default: false },
    progressTracking: { type: Boolean, default: false },
    smartReminders: { type: Boolean, default: false },
    detailedSummaries: { type: Boolean, default: false },
    noAds: { type: Boolean, default: false },
    pdfAnalysis: { type: Boolean, default: false },
    personalizedStudyPlans: { type: Boolean, default: false },
    weakTopicDetection: { type: Boolean, default: false },
    examSimulations: { type: Boolean, default: false },
    voiceAssistant: { type: Boolean, default: false },
    priorityAI: { type: Boolean, default: false },
    memoryAcrossSessions: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
