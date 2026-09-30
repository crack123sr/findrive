import express from 'express';
import {
  stripeWebhookController,
  getWebhookInfoController,
} from '../controllers/webhook.controller.js';

const webhookRoutes = express.Router();

// Stripe webhook endpoint - IMPORTANT: Use raw body, not parsed JSON
// This route should NOT have body parser middleware applied
webhookRoutes.post('/stripe', stripeWebhookController);

// Debug endpoint to check webhook configuration
webhookRoutes.get('/info', getWebhookInfoController);

export default webhookRoutes;
