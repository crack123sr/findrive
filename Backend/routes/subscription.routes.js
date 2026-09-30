import express from 'express';
import {
  getSubscriptionController,
  getAvailablePlansController,
  createCheckoutSessionController,
  cancelSubscriptionController,
  upgradeSubscriptionController,
  checkFeatureAccessController,
} from '../controllers/subscription.controller.js';


const subscriptionRoutes = express.Router();

// Public routes
subscriptionRoutes.get('/plans', getAvailablePlansController);

// Protected routes (require authentication)
subscriptionRoutes.get('/current', getSubscriptionController);
subscriptionRoutes.post('/checkout', createCheckoutSessionController);
subscriptionRoutes.post('/upgrade', upgradeSubscriptionController);
subscriptionRoutes.post('/cancel', cancelSubscriptionController);
subscriptionRoutes.get('/check-feature', checkFeatureAccessController);

export default subscriptionRoutes;
