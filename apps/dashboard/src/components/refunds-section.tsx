'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Users,
  Wallet,
  Server,
  ReceiptText,
  DollarSign,
  Clock,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api, type Facilitator, type ResourceOwner, type ResourceOwnerDetail } from '@/lib/api';
import { cn, formatAddress } from '@/lib/utils';

interface RefundsSectionProps {
  facilitatorId: string;
  facilitator: Facilitator;
}

export function RefundsSection({ facilitatorId, facilitator }: RefundsSectionProps) {
  const queryClient = useQueryClient();
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);

  // Queries
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['refundConfig', facilitatorId],
    queryFn: () => api.getRefundConfig(facilitatorId),
  });

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['refundsOverview', facilitatorId],
    queryFn: () => api.getRefundsOverview(facilitatorId),
  });

  const { data: resourceOwnersData, isLoading: ownersLoading } = useQuery({
    queryKey: ['resourceOwners', facilitatorId],
    queryFn: () => api.getResourceOwners(facilitatorId),
  });

  const { data: ownerDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['resourceOwner', facilitatorId, selectedOwner],
    queryFn: () => selectedOwner ? api.getResourceOwner(facilitatorId, selectedOwner) : null,
    enabled: !!selectedOwner,
  });

  // Mutations
  const updateConfigMutation = useMutation({
    mutationFn: (enabled: boolean) => api.updateRefundConfig(facilitatorId, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refundConfig', facilitatorId] });
    },
  });

  const setupUrl = `${window.location.origin}/claims/setup?facilitator=${facilitator.subdomain}`;

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Refund Protection</CardTitle>
              <CardDescription>
                Enable automatic refund protection for third-party resource owners using your facilitator.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {configData?.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <Switch
                checked={configData?.enabled || false}
                onCheckedChange={(checked) => updateConfigMutation.mutate(checked)}
                disabled={configLoading || updateConfigMutation.isPending}
              />
            </div>
          </div>
        </CardHeader>
        {configData?.enabled && (
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Setup your own refunds */}
              <div className="flex-1 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-sm font-medium">Set Up Your Refund Protection</p>
                      <p className="text-xs text-muted-foreground">
                        Configure refund wallets and register servers for your own resources.
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <a href={setupUrl} target="_blank" rel="noopener noreferrer">
                        Open Setup <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Share with others */}
              <div className="flex-1 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Share with Resource Owners</p>
                    <p className="text-xs text-muted-foreground">
                      Third-party API owners can set up their own refund protection using this link:
                    </p>
                    <code className="text-xs bg-background px-2 py-1 rounded border block overflow-x-auto">
                      {setupUrl}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Overview Stats */}
      {configData?.enabled && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overviewData?.resourceOwners || 0}</p>
                  <p className="text-sm text-muted-foreground">Resource Owners</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Wallet className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${overviewData?.totalWalletBalance || '0.00'}</p>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Server className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overviewData?.totalServers || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Servers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <ReceiptText className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overviewData?.claims?.pending || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Claims Overview */}
      {configData?.enabled && overviewData?.claims && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Claims Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{overviewData.claims.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-500/10">
                <p className="text-2xl font-bold text-yellow-600">{overviewData.claims.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10">
                <p className="text-2xl font-bold text-blue-600">{overviewData.claims.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-600">{overviewData.claims.paid}</p>
                <p className="text-sm text-muted-foreground">Paid</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-600">${overviewData.claims.totalPaidAmount}</p>
                <p className="text-sm text-muted-foreground">Total Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Owners List */}
      {configData?.enabled && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Resource Owners
                </CardTitle>
                <CardDescription>
                  Third-party API owners who have registered for refund protection.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {ownersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !resourceOwnersData?.resourceOwners.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No resource owners registered yet</p>
                <p className="text-sm">Share the setup URL with API owners who want refund protection.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resourceOwnersData.resourceOwners.map((owner) => (
                  <div
                    key={owner.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedOwner(owner.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{owner.name || 'Unnamed'}</span>
                        {owner.refundAddress && (
                          <code className="text-xs text-muted-foreground font-mono">
                            {formatAddress(owner.refundAddress)}
                          </code>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Wallet className="h-3 w-3" /> {owner.stats.wallets} wallets
                        </span>
                        <span className="flex items-center gap-1">
                          <Server className="h-3 w-3" /> {owner.stats.servers} servers
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {owner.stats.pendingClaims} pending
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> ${owner.stats.totalPaidAmount} paid
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resource Owner Detail Dialog */}
      <Dialog open={!!selectedOwner} onOpenChange={() => setSelectedOwner(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resource Owner Details</DialogTitle>
            <DialogDescription>
              {ownerDetail?.name || 'Unnamed'}
              {ownerDetail?.refundAddress && (
                <> · Refund Address: <code className="font-mono">{formatAddress(ownerDetail.refundAddress)}</code></>
              )}
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : ownerDetail ? (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold">{ownerDetail.claimStats.totalClaims}</p>
                  <p className="text-xs text-muted-foreground">Total Claims</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                  <p className="text-xl font-bold text-yellow-600">{ownerDetail.claimStats.pendingClaims}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-500/10">
                  <p className="text-xl font-bold text-green-600">{ownerDetail.claimStats.paidClaims}</p>
                  <p className="text-xs text-muted-foreground">Paid</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-500/10">
                  <p className="text-xl font-bold text-green-600">${ownerDetail.claimStats.totalPaidAmount}</p>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                </div>
              </div>

              {/* Wallets */}
              <div>
                <h4 className="text-sm font-medium mb-2">Refund Wallets</h4>
                {ownerDetail.wallets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No wallets configured</p>
                ) : (
                  <div className="space-y-2">
                    {ownerDetail.wallets.map((wallet) => (
                      <div key={wallet.network} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <Badge variant="outline" className="capitalize">{wallet.network}</Badge>
                          <code className="text-xs ml-2 font-mono">{formatAddress(wallet.address)}</code>
                        </div>
                        <span className="font-medium">${wallet.balance}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Servers */}
              <div>
                <h4 className="text-sm font-medium mb-2">Registered Servers</h4>
                {ownerDetail.servers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No servers registered</p>
                ) : (
                  <div className="space-y-2">
                    {ownerDetail.servers.map((server) => (
                      <div key={server.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <span className="font-medium">{server.name || 'Unnamed'}</span>
                          <p className="text-xs text-muted-foreground truncate">{server.url}</p>
                        </div>
                        <Badge variant={server.active ? 'default' : 'secondary'}>
                          {server.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Claims */}
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Claims</h4>
                {ownerDetail.recentClaims.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No claims yet</p>
                ) : (
                  <div className="space-y-2">
                    {ownerDetail.recentClaims.slice(0, 5).map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                claim.status === 'paid' ? 'default' :
                                claim.status === 'approved' ? 'default' :
                                claim.status === 'pending' ? 'secondary' :
                                'destructive'
                              }
                              className={cn(
                                claim.status === 'paid' && 'bg-green-500',
                                claim.status === 'approved' && 'bg-blue-500',
                              )}
                            >
                              {claim.status}
                            </Badge>
                            <span className="font-medium">${(Number(claim.amount) / 1_000_000).toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            To: {formatAddress(claim.userWallet)}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(claim.reportedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
