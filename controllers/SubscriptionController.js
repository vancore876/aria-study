const Subscription = require('../models/Subscription');

class SubscriptionController {
  static get plans() {
    return {
      FREE: 'free',
      PLUS: 'plus',
      PRO: 'pro',
    };
  }

  static getPlanFeatures(planId) {
    const base = {
      unlimitedChat: true,
      unlimitedFlashcards: false,
      unlimitedQuizzes: false,
      progressTracking: false,
      smartReminders: false,
      detailedSummaries: false,
      noAds: false,
      pdfAnalysis: false,
      personalizedStudyPlans: false,
      weakTopicDetection: false,
      examSimulations: false,
      voiceAssistant: false,
      priorityAI: false,
      memoryAcrossSessions: false
    };

    if (planId === 'plus') {
      return { ...base, unlimitedFlashcards: true, unlimitedQuizzes: true, progressTracking: true, smartReminders: true, detailedSummaries: true, noAds: true };
    }
    if (planId === 'pro') {
      return { ...base, unlimitedFlashcards: true, unlimitedQuizzes: true, progressTracking: true, smartReminders: true, detailedSummaries: true, noAds: true, pdfAnalysis: true, personalizedStudyPlans: true, weakTopicDetection: true, examSimulations: true, voiceAssistant: true, priorityAI: true, memoryAcrossSessions: true };
    }
    return base;
  }

  async createSubscription(req, res) {
    try {
      const { userId, plan } = req.body;
      const startDate = new Date();
      const endDate = new Date(startDate);

      let price = 0;
      if (plan === SubscriptionController.plans.PLUS) {
        endDate.setMonth(endDate.getMonth() + 1);
        price = 4.99;
      } else if (plan === SubscriptionController.plans.PRO) {
        endDate.setMonth(endDate.getMonth() + 1);
        price = 9.99;
      } else {
        // Free plan — no end date
        endDate.setFullYear(endDate.getFullYear() + 100);
      }

      const subscription = new Subscription({
        userId,
        planId: plan,
        startDate,
        endDate,
        price,
        features: SubscriptionController.getPlanFeatures(plan),
        paymentMethod: plan === 'free' ? 'none' : req.body.paymentMethod || 'credit_card'
      });
      await subscription.save();

      res.status(201).json(subscription);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  }

  async getSubscriptions(req, res) {
    try {
      const subscriptions = await Subscription.find({ userId: req.user.id });
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve subscriptions' });
    }
  }
}

module.exports = SubscriptionController;
