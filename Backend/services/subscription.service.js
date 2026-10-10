import stripe from '../config/stripe.config.js';
import SubscriptionModel, { PlanEnum, SubscriptionStatusEnum } from '../models/subscription.model.js';
import UserModel from '../models/user.model.js';
import { BadRequestException, NotFoundException } from '../utils/app-error.js';

// Static plan configuration (without pricing - will be fetched from Stripe)
const PLAN_CONFIG = {
  [PlanEnum.FREE]: {
    name: 'Free',
    features: ['Basic transaction tracking', 'Manual receipt entry', 'Monthly reports'],
    transactionLimit: 50,
  },
  [PlanEnum.PRO]: {
    name: 'Pro',
    features: [
      'Unlimited transactions',
      'AI receipt scanning',
      'Weekly reports',
      'Budget tracking',
      'Category insights',
    ],
    transactionLimit: null,
  },
  [PlanEnum.PREMIUM]: {
    name: 'Premium',
    features: [
      'Everything in Pro',
      'Daily reports',
      'Advanced analytics',
      'Investment tracking',
      'Tax planning tools',
      'Priority support',
    ],
    transactionLimit: null,
  },
};

// Cache for Stripe prices (to avoid excessive API calls)
let stripePromoCache = null;
let cacheTTL = Date.now(); // Cache timestamp

/**
 * Fetch prices from Stripe API dynamically
 * This fetches all active prices and matches them with plan names
 */
export const fetchStripePricesFromAPI = async () => {
  try {
    // Use cache if available and fresh (cache for 1 hour)
    if (stripePromoCache && Date.now() - cacheTTL < 3600000) {
      console.log('✅ Using cached Stripe prices');
      return stripePromoCache;
    }

    console.log('🔄 Fetching prices from Stripe API...');

    // Fetch all products
    const products = await stripe.products.list({ 
      active: true,
      limit: 100 
    });

    const pricingMap = {
      [PlanEnum.FREE]: {
        ...PLAN_CONFIG[PlanEnum.FREE],
        price: 0,
        stripePriceId: null,
      },
    };

    // For each product, find its corresponding price
    for (const product of products.data) {
      // Check if product name matches our plans
      const productName = product.name?.toLowerCase() || '';
      
      let planType = null;
      if (productName.includes('pro') && !productName.includes('premium')) {
        planType = PlanEnum.PRO;
      } else if (productName.includes('premium')) {
        planType = PlanEnum.PREMIUM;
      }

      if (planType && PLAN_CONFIG[planType]) {
        // Get active prices for this product
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        if (prices.data.length > 0) {
          // Get the first active price (assuming one price per plan)
          const price = prices.data[0];
          
          pricingMap[planType] = {
            ...PLAN_CONFIG[planType],
            price: price.unit_amount, // Price in cents
            stripePriceId: price.id,
          };

          console.log(`✅ Found ${planType} plan: ${price.id} (₹${price.unit_amount / 100})`);
        }
      }
    }

    // Cache the pricing
    stripePromoCache = pricingMap;
    cacheTTL = Date.now();

    return pricingMap;
  } catch (err) {
    console.error('❌ Error fetching prices from Stripe:', err.message);
    
    // Fallback to environment variables if API call fails
    console.log('⚠️  Falling back to environment variables...');
    return getFallbackPricing();
  }
};

/**
 * Fallback pricing using environment variables
 */
const getFallbackPricing = () => {
  // Clean up environment variables (remove quotes and spaces)
  const cleanEnv = (value) => {
    if (!value) return null;
    return String(value).trim().replace(/['"]/g, '');
  };

  return {
    [PlanEnum.FREE]: {
      ...PLAN_CONFIG[PlanEnum.FREE],
      price: 0,
      stripePriceId: null,
    },
    [PlanEnum.PRO]: {
      ...PLAN_CONFIG[PlanEnum.PRO],
      price: 29900, // Fallback: ₹299/month in cents
      stripePriceId: cleanEnv(process.env.STRIPE_PRICE_ID_PRO),
    },
    [PlanEnum.PREMIUM]: {
      ...PLAN_CONFIG[PlanEnum.PREMIUM],
      price: 49900, // Fallback: ₹499/month in cents
      stripePriceId: cleanEnv(process.env.STRIPE_PRICE_ID_PREMIUM),
    },
  };
};

/**
 * Get plan pricing (always fetch fresh or use cache)
 */
const getPlanPricing = async () => {
  return await fetchStripePricesFromAPI();
};

/**
 * Create or get Stripe customer
 */
export const createOrGetStripeCustomer = async (userId, email, name) => {
  try {
    // Check if customer already exists in our database
    let subscription = await SubscriptionModel.findOne({ userId });

    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: userId.toString(),
      },
    });

    return customer.id;
  } catch (err) {
    console.error('Error creating Stripe customer:', err);
    throw err;
  }
};

/**
 * Create checkout session for subscription upgrade
 */
export const createCheckoutSessionService = async (userId, planType) => {
  try {
    // Get plan pricing from Stripe API
    const PLAN_PRICING = await getPlanPricing();

    // Validate plan
    if (!PLAN_PRICING[planType]) {
      throw new BadRequestException('Invalid plan type');
    }

    // Get user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create/get Stripe customer
    const customerId = await createOrGetStripeCustomer(userId, user.email, user.name);

    // For FREE plan, no checkout needed
    if (planType === PlanEnum.FREE) {
      return {
        sessionId: null,
        checkoutUrl: null,
        message: 'Downgrade to free plan completed',
      };
    }

    // Get the price ID for the plan
    const stripePriceId = PLAN_PRICING[planType].stripePriceId;
    if (!stripePriceId) {
      throw new BadRequestException(
        `Price ID not found for plan: ${planType}. Please ensure the product is created in Stripe.`
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          planType: planType,
        },
      },
      client_reference_id: userId.toString(),
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      customerId,
    };
  } catch (err) {
    console.error('Error creating checkout session:', err);
    throw err;
  }
};

/**
 * Handle successful subscription from Stripe webhook
 */
export const handleSubscriptionCreated = async (stripeSubscription) => {
  try {
    const userId = stripeSubscription.metadata.userId;
    const planType = stripeSubscription.metadata.planType;

    const user = await UserModel.findById(userId);
    if (!user) {
      console.error(`User not found for subscription: ${userId}`);
      return;
    }

    const subscription = await SubscriptionModel.findOneAndUpdate(
      { userId },
      {
        userId,
        stripeCustomerId: stripeSubscription.customer,
        stripeSubscriptionId: stripeSubscription.id,
        plan: planType,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        lastPaymentStatus: 'succeeded',
        lastPaymentDate: new Date(),
        autoRenew: !stripeSubscription.cancel_at_period_end,
        metadata: {
          ...stripeSubscription.metadata,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Subscription created for user ${userId}: ${planType}`);
    return subscription;
  } catch (err) {
    console.error('Error handling subscription created:', err);
    throw err;
  }
};

/**
 * Handle subscription updated from Stripe webhook
 */
export const handleSubscriptionUpdated = async (stripeSubscription) => {
  try {
    const subscription = await SubscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId: stripeSubscription.id },
      {
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        autoRenew: !stripeSubscription.cancel_at_period_end,
        ...(stripeSubscription.canceled_at && {
          canceledAt: new Date(stripeSubscription.canceled_at * 1000),
        }),
      },
      { new: true }
    );

    console.log(`✅ Subscription updated: ${stripeSubscription.id}`);
    return subscription;
  } catch (err) {
    console.error('Error handling subscription updated:', err);
    throw err;
  }
};

/**
 * Handle payment succeeded from Stripe webhook
 */
export const handlePaymentSucceeded = async (invoice) => {
  try {
    const subscription = await SubscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId: invoice.subscription },
      {
        lastPaymentStatus: 'succeeded',
        lastPaymentDate: new Date(),
        status: SubscriptionStatusEnum.ACTIVE,
      },
      { new: true }
    );

    console.log(`✅ Payment succeeded for subscription: ${invoice.subscription}`);
    return subscription;
  } catch (err) {
    console.error('Error handling payment succeeded:', err);
    throw err;
  }
};

/**
 * Handle payment failed from Stripe webhook
 */
export const handlePaymentFailed = async (invoice) => {
  try {
    const subscription = await SubscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId: invoice.subscription },
      {
        lastPaymentStatus: 'failed',
        status: SubscriptionStatusEnum.PAST_DUE,
      },
      { new: true }
    );

    console.log(`❌ Payment failed for subscription: ${invoice.subscription}`);
    return subscription;
  } catch (err) {
    console.error('Error handling payment failed:', err);
    throw err;
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscriptionService = async (userId, immediate = false) => {
  try {
    const subscription = await SubscriptionModel.findOne({ userId });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.stripeSubscriptionId) {
      throw new BadRequestException('No active Stripe subscription');
    }

    // Cancel at period end by default (graceful)
    // Or immediately if requested
    const canceledSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: !immediate,
    });

    // If immediate cancellation
    if (immediate) {
      await stripe.subscriptions.del(subscription.stripeSubscriptionId);
    }

    const updatedSubscription = await SubscriptionModel.findOneAndUpdate(
      { userId },
      {
        ...(immediate && { plan: PlanEnum.FREE, status: SubscriptionStatusEnum.CANCELED }),
        ...(!immediate && { cancelAtPeriodEnd: true }),
        canceledAt: immediate ? new Date() : undefined,
      },
      { new: true }
    );

    console.log(`✅ Subscription canceled for user ${userId}`);
    return updatedSubscription;
  } catch (err) {
    console.error('Error canceling subscription:', err);
    throw err;
  }
};

/**
 * Get subscription details
 */
export const getSubscriptionService = async (userId) => {
  try {
    console.log('========== GET SUBSCRIPTION ==========');
    console.log('userId:', userId);
    console.log('userId type:', typeof userId);

    const subscription = await SubscriptionModel.findOne({ userId });

    console.log('SUBSCRIPTION FOUND:', subscription);

    if (!subscription) {
      const user = await UserModel.findById(userId);

      console.log('USER FOUND:', user);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const customerId = await createOrGetStripeCustomer(
        userId,
        user.email,
        user.name
      );

      return await SubscriptionModel.create({
        userId,
        stripeCustomerId: customerId,
        plan: PlanEnum.FREE,
        status: SubscriptionStatusEnum.ACTIVE,
      });
    }

    return subscription;
  } catch (err) {
    console.error('Error getting subscription:', err);
    throw err;
  }
};

/**
 * Upgrade subscription to new plan
 */
export const upgradeSubscriptionService = async (userId, newPlan) => {
  try {
    // Get plan pricing from Stripe API
    const PLAN_PRICING = await getPlanPricing();

    if (!PLAN_PRICING[newPlan]) {
      throw new BadRequestException('Invalid plan type');
    }

    const subscription = await SubscriptionModel.findOne({ userId });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // If upgrading from FREE, need to create checkout session
    if (subscription.plan === PlanEnum.FREE) {
      return await createCheckoutSessionService(userId, newPlan);
    }

    // For existing subscriptions, update in Stripe
    if (subscription.stripeSubscriptionId) {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

      // Get current subscription item
      const subscriptionItem = stripeSubscription.items.data[0];

      // Get the price ID for the new plan
      const stripePriceId = PLAN_PRICING[newPlan].stripePriceId;
      if (!stripePriceId) {
        throw new BadRequestException(
          `Price ID not found for plan: ${newPlan}. Please ensure the product is created in Stripe.`
        );
      }

      // Update with new price
      const updatedSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [
          {
            id: subscriptionItem.id,
            price: stripePriceId,
          },
        ],
        proration_behavior: 'create_prorations',
        metadata: {
          ...stripeSubscription.metadata,
          planType: newPlan,
        },
      });

      // Update our database
      const updated = await SubscriptionModel.findOneAndUpdate(
        { userId },
        {
          plan: newPlan,
          metadata: updatedSubscription.metadata,
        },
        { new: true }
      );

      console.log(`✅ Plan upgraded for user ${userId} to ${newPlan}`);
      return updated;
    }
  } catch (err) {
    console.error('Error upgrading subscription:', err);
    throw err;
  }
};

/**
 * Get available plans with pricing (fetched from Stripe API)
 */
export const getAvailablePlansService = async () => {
  try {
    const PLAN_PRICING = await getPlanPricing();
    
    return Object.entries(PLAN_PRICING).map(([key, value]) => ({
      id: key,
      name: value.name,
      monthlyPrice: value.price / 100, // Convert paise to rupees
      stripePriceId: value.stripePriceId,
      features: value.features,
      transactionLimit: value.transactionLimit,
    }));
  } catch (err) {
    console.error('Error getting available plans:', err);
    throw err;
  }
};

/**
 * Check if user has access to feature
 */
export const checkFeatureAccessService = async (userId, featureName) => {
  try {
    const subscription = await SubscriptionModel.findOne({ userId });

    if (!subscription) {
      return false;
    }

    const featureAccess = {
      aiReceiptScanning: [PlanEnum.PRO, PlanEnum.PREMIUM],
      weeklyReports: [PlanEnum.PRO, PlanEnum.PREMIUM],
      dailyReports: [PlanEnum.PREMIUM],
      advancedAnalytics: [PlanEnum.PREMIUM],
      investmentTracking: [PlanEnum.PREMIUM],
      unlimitedTransactions: [PlanEnum.PRO, PlanEnum.PREMIUM],
    };

    return featureAccess[featureName]?.includes(subscription.plan) || false;
  } catch (err) {
    console.error('Error checking feature access:', err);
    return false;
  }
};

/**
 * Extend free trial (admin only)
 */
export const extendFreeTrialService = async (userId, days = 7) => {
  try {
    const subscription = await SubscriptionModel.findOne({ userId });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + days);

    const updated = await SubscriptionModel.findOneAndUpdate(
      { userId },
      { trialEndDate },
      { new: true }
    );

    console.log(`✅ Trial extended for user ${userId} by ${days} days`);
    return updated;
  } catch (err) {
    console.error('Error extending trial:', err);
    throw err;
  }
};