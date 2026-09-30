import { useState } from 'react';
import { Card } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import {
  useGetCurrentSubscriptionQuery,
  useCancelSubscriptionMutation,
  useUpgradeSubscriptionMutation,
} from '@/features/subscription/subscriptionAPI';

export default function SubscriptionCard() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const { data: subscriptionData, isLoading: loading, error: subscriptionError } = useGetCurrentSubscriptionQuery();
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const [upgradeSubscription] = useUpgradeSubscriptionMutation();

  const subscription = subscriptionData?.subscription || null;

  if (subscriptionError) {
    toast.error('Failed to load subscription details');
  }

  // Handle cancel subscription
  const handleCancelSubscription = async (immediate: boolean = false) => {
    setCanceling(true);
    try {
      await cancelSubscription({ immediate }).unwrap();
      toast.success(
        immediate
          ? 'Subscription canceled immediately'
          : 'Subscription scheduled for cancellation at the end of the billing period'
      );
      setShowCancelDialog(false);
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      toast.error(error?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Loading subscription details...</p>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No subscription data available</p>
      </Card>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    canceled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    paused: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  const paymentStatusColors = {
    succeeded: 'text-green-600',
    failed: 'text-red-600',
    pending: 'text-yellow-600',
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Subscription</h3>
            <p className="text-sm text-muted-foreground">Manage your plan and billing</p>
          </div>
          <Badge className={statusColors[subscription.status as keyof typeof statusColors] || ''}>
            {subscription.status}
          </Badge>
        </div>

        {/* Plan Info */}
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="text-2xl font-bold">{subscription.plan}</p>
          </div>

          {/* Billing Period */}
          {subscription.currentPeriodEnd && (
            <div>
              <p className="text-sm text-muted-foreground">Billing Period</p>
              <p className="text-sm">
                Renews on {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
              </p>
            </div>
          )}

          {/* Auto-Renewal Status */}
          <div className="flex items-center gap-2">
            {subscription.autoRenew ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm">Auto-renewal enabled</p>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-yellow-600" />
                <p className="text-sm">Will be canceled on {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}</p>
              </>
            )}
          </div>

          {/* Last Payment Status */}
          {subscription.lastPaymentDate && (
            <div>
              <p className="text-sm text-muted-foreground">Last Payment</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {format(new Date(subscription.lastPaymentDate), 'MMM dd, yyyy')}
                </span>
                <Badge
                  variant="outline"
                  className={paymentStatusColors[subscription.lastPaymentStatus as keyof typeof paymentStatusColors]}
                >
                  {subscription.lastPaymentStatus}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
            Change Plan
          </Button>

          {subscription.status === 'active' && subscription.autoRenew && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Subscription
            </Button>
          )}

          {!subscription.autoRenew && (
            <Button
              onClick={async () => {
                try {
                  await upgradeSubscription({ newPlan: subscription.plan }).unwrap();
                  toast.success('Auto-renewal re-enabled');
                } catch (error) {
                  toast.error('Failed to re-enable auto-renewal');
                }
              }}
            >
              Re-enable Auto-renewal
            </Button>
          )}
        </div>

        {/* Payment Issues Alert */}
        {subscription.status === 'past_due' && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Payment Past Due</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please update your payment method to continue using premium features.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll lose access to premium features.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm font-medium mb-2">What happens next?</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• You'll have access until the end of your current billing period</li>
              <li>• Your data will be preserved</li>
              <li>• You can reactivate anytime</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCancelSubscription(false)}
              disabled={canceling}
            >
              {canceling ? 'Canceling...' : 'Cancel at Period End'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCancelSubscription(true)}
              disabled={canceling}
            >
              {canceling ? 'Canceling...' : 'Cancel Immediately'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
