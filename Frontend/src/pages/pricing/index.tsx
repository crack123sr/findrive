import { useState } from 'react';
import { Button } from '../../components/ui/button.tsx';
import { Card } from '../../components/ui/card.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { Check } from 'lucide-react';
import { toast } from 'sonner'
import { useTypedSelector } from '../../app/hook';
import { useNavigate } from 'react-router-dom';
import {
  useGetPlansQuery,
  useGetCurrentSubscriptionQuery,
  useUpgradeSubscriptionMutation,
} from '../../features/subscription/subscriptionAPI';

export default function PricingPage() {
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const { user } = useTypedSelector((state) => state.auth);
  const navigate = useNavigate();

  const { data: plansData, isLoading: plansLoading, error: plansError } = useGetPlansQuery();
  const {
    data: subscriptionData,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useGetCurrentSubscriptionQuery(undefined, { skip: !user });
  const [upgradeSubscription] = useUpgradeSubscriptionMutation();

  const plans = plansData?.plans || [];
  const currentPlan = subscriptionData?.subscription?.plan || 'FREE';
  const loading = plansLoading || subscriptionLoading;

  if (plansError || subscriptionError) {
    if (plansError) {
      toast.error('Failed to load pricing plans');
    }
    if (subscriptionError) {
      console.error('Failed to fetch subscription:', subscriptionError);
    }
  }

  // Handle plan upgrade
  const handleUpgrade = async (planId: string) => {
    if (!user) {
      navigate('/sign-in');
      return;
    }

    if (planId === currentPlan) {
      toast.info(`You're already on the ${planId} plan`);
      return;
    }

    setUpgrading(planId);
    try {
      const response = await upgradeSubscription({ newPlan: planId }).unwrap();

      if (response.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.checkoutUrl;
      } else if (planId === 'FREE') {
        toast.success('Successfully downgraded to Free plan');
      } else {
        toast.success('Plan upgraded successfully');
      }
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      toast.error(error?.data?.message || 'Failed to upgrade plan');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading pricing plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your financial management needs
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan: any) => {
            const isCurrentPlan = plan.id === currentPlan;

            return (
              <Card
                key={plan.id}
                className={`relative p-8 flex flex-col h-full transition-all duration-200 ${
                  isCurrentPlan ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-lg'
                }`}
              >
                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2" variant="default">
                    Current Plan
                  </Badge>
                )}

                {/* Plan Name */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  {plan.monthlyPrice > 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">₹{plan.monthlyPrice}</span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold">Free</p>
                  )}
                </div>

                {/* Transaction Limit */}
                {plan.transactionLimit !== null && (
                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.transactionLimit} transactions/year
                  </p>
                )}

                {/* CTA Button */}
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || upgrading === plan.id}
                  className="w-full mb-8"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                >
                  {upgrading === plan.id
                    ? 'Processing...'
                    : isCurrentPlan
                    ? 'Current Plan'
                    : 'Upgrade Now'}
                </Button>

                {/* Features List */}
                <div className="space-y-4 flex-grow">
                  <p className="font-semibold text-sm">Features included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature: any, idx: any) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade, downgrade, or cancel your plan anytime. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                The Free plan includes all basic features. Upgrade to Pro or Premium to access advanced features
                like AI receipt scanning and detailed analytics.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit and debit cards through Stripe. Your payment information is secure and
                never stored on our servers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I get a refund?</h3>
              <p className="text-muted-foreground">
                You can cancel your subscription at any time. If you cancel before your billing cycle ends, you'll
                have access until the end of the period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
