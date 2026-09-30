import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import { httpStatus } from '../config/http.config.js';
import {
  createCheckoutSessionService,
  getSubscriptionService,
  cancelSubscriptionService,
  upgradeSubscriptionService,
  getAvailablePlansService,
  checkFeatureAccessService,
} from '../services/subscription.service.js';

/**
 * Get current subscription details
 */
export const getSubscriptionController = asyncHandler(async (req, res) => {
  console.log("========== SUBSCRIPTION ==========");
  console.log("req.user:", req.user);
  console.log("req.user._id:", req.user?._id);

  const userId = req.user?._id;

  const subscription = await getSubscriptionService(userId);

  return res.status(httpStatus.OK).json({
    message: 'Subscription retrieved successfully',
    subscription,
  });
});

/**
 * Get all available plans
 */
export const getAvailablePlansController = asyncHandler(async (req, res) => {
  const plans = await getAvailablePlansService();

  return res.status(httpStatus.OK).json({
    message: 'Available plans retrieved successfully',
    plans,
  });
});

/**
 * Create checkout session for plan upgrade
 */
export const createCheckoutSessionController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { planType } = req.body;

  if (!planType) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Plan type is required',
    });
  }

  const result = await createCheckoutSessionService(userId, planType);

  return res.status(httpStatus.CREATED).json({
    message: 'Checkout session created successfully',
    sessionId: result.sessionId,
    checkoutUrl: result.checkoutUrl,
    customerId: result.customerId,
  });
});

/**
 * Cancel subscription
 */
export const cancelSubscriptionController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { immediate = false } = req.body;

  const subscription = await cancelSubscriptionService(userId, immediate);

  return res.status(httpStatus.OK).json({
    message: `Subscription ${immediate ? 'canceled' : 'scheduled for cancellation'} successfully`,
    subscription,
  });
});

/**
 * Upgrade subscription plan
 */
export const upgradeSubscriptionController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { newPlan } = req.body;

  if (!newPlan) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'New plan type is required',
    });
  }

  const result = await upgradeSubscriptionService(userId, newPlan);

  // If it's a checkout session (upgrading from FREE)
  if (result.checkoutUrl) {
    return res.status(httpStatus.CREATED).json({
      message: 'Checkout session created for plan upgrade',
      sessionId: result.sessionId,
      checkoutUrl: result.checkoutUrl,
    });
  }

  // If it's a subscription update
  return res.status(httpStatus.OK).json({
    message: 'Subscription upgraded successfully',
    subscription: result,
  });
});

/**
 * Check feature access
 */
export const checkFeatureAccessController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { featureName } = req.query;

  if (!featureName) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Feature name is required',
    });
  }

  const hasAccess = await checkFeatureAccessService(userId, featureName);

  return res.status(httpStatus.OK).json({
    message: 'Feature access checked',
    featureName,
    hasAccess,
  });
});