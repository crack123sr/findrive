import SubscriptionModel, { PlanEnum } from '../models/subscription.model.js';
import { ForbiddenException } from '../utils/app-error.js';

/**
 * Middleware to check if user has a specific plan or higher
 * Usage: router.get('/route', requirePlan(PlanEnum.PRO), controller)
 */
export const requirePlan = (requiredPlan) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new ForbiddenException('Authentication required');
      }

      const subscription = await SubscriptionModel.findOne({ userId });

      // Plan hierarchy: FREE < PRO < PREMIUM
      const planHierarchy = {
        [PlanEnum.FREE]: 0,
        [PlanEnum.PRO]: 1,
        [PlanEnum.PREMIUM]: 2,
      };

      const userPlanLevel = planHierarchy[subscription?.plan] || 0;
      const requiredLevel = planHierarchy[requiredPlan] || 0;

      if (userPlanLevel < requiredLevel) {
        throw new ForbiddenException(
          `This feature requires ${requiredPlan} plan. Your current plan: ${subscription?.plan || 'FREE'}`
        );
      }

      // Attach subscription to request
      req.subscription = subscription;
      next();
    } catch (err) {
      res.status(403).json({
        message: err.message || 'Access denied',
      });
    }
  };
};

/**
 * Middleware to check if user has access to a specific feature
 * Usage: router.get('/route', requireFeature('aiReceiptScanning'), controller)
 */
export const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new ForbiddenException('Authentication required');
      }

      const subscription = await SubscriptionModel.findOne({ userId });

      const featureAccess = {
        aiReceiptScanning: [PlanEnum.PRO, PlanEnum.PREMIUM],
        weeklyReports: [PlanEnum.PRO, PlanEnum.PREMIUM],
        dailyReports: [PlanEnum.PREMIUM],
        advancedAnalytics: [PlanEnum.PREMIUM],
        investmentTracking: [PlanEnum.PREMIUM],
        unlimitedTransactions: [PlanEnum.PRO, PlanEnum.PREMIUM],
        budgetTracking: [PlanEnum.PRO, PlanEnum.PREMIUM],
        categoryInsights: [PlanEnum.PRO, PlanEnum.PREMIUM],
      };

      const allowedPlans = featureAccess[featureName] || [];

      if (!allowedPlans.includes(subscription?.plan)) {
        const requiredPlan = allowedPlans[allowedPlans.length - 1] || PlanEnum.PRO;
        throw new ForbiddenException(
          `The "${featureName}" feature requires ${requiredPlan} plan or higher`
        );
      }

      req.subscription = subscription;
      next();
    } catch (err) {
      res.status(403).json({
        message: err.message || 'Feature access denied',
      });
    }
  };
};

/**
 * Middleware to check transaction limits based on plan
 */
export const checkTransactionLimit = () => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new ForbiddenException('Authentication required');
      }

      const subscription = await SubscriptionModel.findOne({ userId });
      const plan = subscription?.plan || PlanEnum.FREE;

      const transactionLimits = {
        [PlanEnum.FREE]: 50,
        [PlanEnum.PRO]: null, // unlimited
        [PlanEnum.PREMIUM]: null, // unlimited
      };

      const TransactionModel = (await import('../models/transaction.model.js')).default;
      const transactionCount = await TransactionModel.countDocuments({ userId });
      const limit = transactionLimits[plan];

      if (limit && transactionCount >= limit) {
        throw new ForbiddenException(
          `You have reached your transaction limit (${limit}). Upgrade to PRO for unlimited transactions.`
        );
      }

      req.transactionLimit = limit;
      next();
    } catch (err) {
      if (err.message.includes('transaction limit')) {
        return res.status(403).json({
          message: err.message,
          requiresUpgrade: true,
        });
      }
      res.status(500).json({
        message: 'Error checking transaction limit',
      });
    }
  };
};
