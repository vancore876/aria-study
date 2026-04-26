class Subscription {
  constructor(id, userId, plan, startDate, endDate, price = 0, features = {}) {
    this.id = id;
    this.userId = userId;
    this.plan = plan;
    this.startDate = startDate;
    this.endDate = endDate;
    this.price = price;
    this.features = features;
  }

  static get plans() {
    return {
      FREE: 'free',
      PLUS: 'plus',
      PRO: 'pro',
    };
  }

  isExpired() {
    return new Date(this.endDate) < new Date();
  }

  isActive() {
    return !this.isExpired();
  }
}

module.exports = Subscription;
