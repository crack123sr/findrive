import { apiClient } from "@/app/api-client.ts";

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  stripePriceId: string;
  features: string[];
  transactionLimit: number | null;
}

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  lastPaymentDate: string;
  lastPaymentStatus: string;
  autoRenew: boolean;
}

interface GetPlansResponse {
  plans: Plan[];
}

interface GetCurrentSubscriptionResponse {
  subscription: Subscription;
}

interface UpgradeSubscriptionRequest {
  newPlan: string;
}

interface UpgradeSubscriptionResponse {
  checkoutUrl?: string;
  subscription?: Subscription;
}

interface CancelSubscriptionRequest {
  immediate?: boolean;
}

const subscriptionAPI = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<GetPlansResponse, void>({
      query: () => ({
        url: "/subscriptions/plans",
        method: "GET",
      }),
      providesTags: ["billingSubscription"],
    }),

    getCurrentSubscription: builder.query<GetCurrentSubscriptionResponse, void>({
      query: () => ({
        url: "/subscriptions/current",
        method: "GET",
      }),
      providesTags: ["billingSubscription"],
    }),

    upgradeSubscription: builder.mutation<UpgradeSubscriptionResponse, UpgradeSubscriptionRequest>({
      query: (body) => ({
        url: "/subscriptions/upgrade",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["billingSubscription"],
    }),

    cancelSubscription: builder.mutation<void, CancelSubscriptionRequest>({
      query: (body) => ({
        url: "/subscriptions/cancel",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["billingSubscription"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetCurrentSubscriptionQuery,
  useUpgradeSubscriptionMutation,
  useCancelSubscriptionMutation,
} = subscriptionAPI;
