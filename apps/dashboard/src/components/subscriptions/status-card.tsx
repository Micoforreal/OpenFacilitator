'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import type { SubscriptionStatus } from '@/lib/api';

type SubscriptionState = 'active' | 'pending' | 'inactive' | 'never';

function getSubscriptionState(subscription: SubscriptionStatus | null | undefined): SubscriptionState {
  if (!subscription || subscription.tier === null) return 'never';
  if (subscription.active) return 'active';

  // Check if in grace period (7 days after expiration)
  if (subscription.expires) {
    const expiresDate = new Date(subscription.expires);
    const gracePeriodEnd = new Date(expiresDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
    if (new Date() < gracePeriodEnd) return 'pending';
  }

  return 'inactive';
}

const statusConfig = {
  active: {
    icon: CheckCircle,
    label: 'Active',
    description: 'Your subscription is active',
    className: 'text-green-600 dark:text-green-400',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    description: 'Payment pending or in grace period',
    className: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  inactive: {
    icon: XCircle,
    label: 'Expired',
    description: 'Your subscription has expired',
    className: 'text-red-600 dark:text-red-400',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  never: {
    icon: AlertCircle,
    label: 'Not Subscribed',
    description: 'Subscribe to create facilitators',
    className: 'text-gray-600 dark:text-gray-400',
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  },
};

interface StatusCardProps {
  subscription: SubscriptionStatus | null | undefined;
  onSubscribe?: () => void;
  isSubscribing?: boolean;
}

export function StatusCard({ subscription, onSubscribe, isSubscribing }: StatusCardProps) {
  const state = getSubscriptionState(subscription);
  const config = statusConfig[state];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Subscription Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-8 h-8 ${config.className}`} />
          <div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.badgeClass}`}>
              {config.label}
            </span>
            <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
          </div>
        </div>

        {(state === 'never' || state === 'inactive') && onSubscribe && (
          <Button
            onClick={onSubscribe}
            className="w-full"
            disabled={isSubscribing}
          >
            {isSubscribing ? 'Processing...' : 'Subscribe Now'}
          </Button>
        )}

        {state === 'pending' && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Please fund your wallet to continue your subscription.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
