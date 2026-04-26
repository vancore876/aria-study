const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/SubscriptionController');

router.post('/create', SubscriptionController.createSubscription);
router.get('/all', SubscriptionController.getSubscriptions);

module.exports = router;
