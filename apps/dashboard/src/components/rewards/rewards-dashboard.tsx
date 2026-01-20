'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Trophy, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProgressTab } from './progress-tab';
import { AddressesTab } from './addresses-tab';
import { HistoryTab } from './history-tab';
import { useAuth } from '@/components/auth/auth-provider';

const VALID_TABS = ['progress', 'addresses', 'history'] as const;
type TabValue = (typeof VALID_TABS)[number];

export function RewardsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useAuth();

  // Read tab from URL or default to 'progress'
  const tabParam = searchParams.get('tab');
  const currentTab: TabValue = VALID_TABS.includes(tabParam as TabValue)
    ? (tabParam as TabValue)
    : 'progress';

  const handleTabChange = (value: string) => {
    router.push(`/rewards?tab=${value}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Rewards
          </h1>
          <p className="text-muted-foreground mt-2">
            Earn $OPEN tokens by processing volume through OpenFacilitator.
          </p>
        </div>
        {isAdmin && (
          <Link href="/rewards/admin">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Campaigns
            </Button>
          </Link>
        )}
      </div>

      {/* Tabbed Content */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <ProgressTab />
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <AddressesTab />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
