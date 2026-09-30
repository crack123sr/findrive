import stripe from '../config/stripe.config.js';
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handlePaymentSucceeded,
  handlePaymentFailed,
} from '../services/subscription.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import { httpStatus } from '../config/http.config.js';

/**
 * Handle Stripe webhook events
 * This endpoint receives events from Stripe about subscription and payment changes
 */
export const stripeWebhookController = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body, // Raw request body (not parsed)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).json({
      error: `Webhook Error: ${err.message}`,
    });
  }

  console.log(`📨 Received Stripe event: ${event.type}`);

  try {
    // Handle different event types
    switch (event.type) {
      // Subscription created
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      // Subscription updated
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      // Subscription deleted
      case 'customer.subscription.deleted':
        console.log('Subscription deleted:', event.data.object.id);
        break;

      // Invoice payment succeeded
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      // Invoice payment failed
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      // Invoice finalized
      case 'invoice.finalized':
        console.log('Invoice finalized:', event.data.object.id);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt of event
    return res.status(httpStatus.OK).json({
      success: true,
      message: `Webhook processed for event: ${event.type}`,
    });
  } catch (err) {
    console.error('❌ Error processing webhook event:', err);
    // Still return 200 to prevent Stripe from retrying
    // Log the error for manual investigation
    return res.status(httpStatus.OK).json({
      success: false,
      error: err.message,
      eventType: event.type,
    });
  }
});

/**
 * Get webhook endpoint info (for debugging)
 */
export const getWebhookInfoController = asyncHandler(async (req, res) => {
  return res.status(httpStatus.OK).json({
    message: 'Stripe webhook endpoint configured',
    endpoint: '/api/webhooks/stripe',
    events: [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'invoice.finalized',
    ],
  });
});
