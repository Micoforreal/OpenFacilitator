'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { StatusCard } from '@/components/subscriptions/status-card';
import { BillingCard } from '@/components/subscriptions/billing-card';
import { PaymentHistory } from '@/components/subscriptions/payment-history';
import { WalletCards } from '@/components/subscriptions/wallet-cards';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export default function SubscriptionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch subscription status
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.getSubscriptionStatus(),
    enabled: isAuthenticated,
  });

  // Fetch payment history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['subscriptionHistory'],
    queryFn: () => api.getSubscriptionHistory(),
    enabled: isAuthenticated,
  });

  // Purchase subscription mutation
  const purchaseMutation = useMutation({
    mutationFn: () => api.purchaseSubscription(),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Subscription activated!',
          description: 'Your subscription is now active.',
        });
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
        queryClient.invalidateQueries({ queryKey: ['subscriptionHistory'] });
        queryClient.invalidateQueries({ queryKey: ['billingWallet'] });
      } else if (result.insufficientBalance) {
        toast({
          title: 'Insufficient balance',
          description: `You need $${result.required} but only have $${result.available}. Please fund your wallet.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Purchase failed',
          description: result.error || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Purchase failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and view payment history.
          </p>
        </div>

        {/* Status and Billing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatusCard
            subscription={subscription}
            onSubscribe={() => purchaseMutation.mutate()}
            isSubscribing={purchaseMutation.isPending}
          />
          <BillingCard subscription={subscription} />
        </div>

        {/* Wallet Cards Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Subscription Wallets</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Fund these wallets with USDC to pay for your subscription. You can use either chain.
          </p>
          <WalletCards />
        </div>

        {/* Payment History */}
        <PaymentHistory
          payments={historyData?.payments || []}
          isLoading={historyLoading}
        />
      </main>
    </div>
  );
}
