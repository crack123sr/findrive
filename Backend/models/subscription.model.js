import mongoose from 'mongoose';

const SubscriptionStatusEnum = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
  PAUSED: 'paused',
};

const PlanEnum = {
  FREE: 'FREE',
  PRO: 'PRO',
  PREMIUM: 'PREMIUM',
};

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true, // Can be null for FREE tier
    },
    plan: {
      type: String,
      enum: Object.values(PlanEnum),
      default: PlanEnum.FREE,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatusEnum),
      default: SubscriptionStatusEnum.ACTIVE,
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
    },
    stripePaymentMethodId: {
      type: String,
    },
    lastPaymentStatus: {
      type: String,
      enum: ['succeeded', 'failed', 'pending'],
      default: 'pending',
    },
    lastPaymentDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    trialEndDate: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for querying subscriptions by status and renewal date
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });


export default mongoose.model('Subscription', subscriptionSchema);
export { SubscriptionStatusEnum, PlanEnum };
