'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddressCard, type AddressData } from './address-card';
import { RemoveAddressDialog } from './remove-address-dialog';
import { api, type RewardsStatus } from '@/lib/api';
import { Plus, Wallet } from 'lucide-react';

const MAX_ADDRESSES = 5;

interface AddressListProps {
  addresses: RewardsStatus['addresses'];
  onAddAddress: () => void;
  onAddressRemoved: () => void;
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <span>{title}</span>
      <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{count}</span>
    </div>
  );
}

function EmptyState({ onAddAddress }: { onAddAddress: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="p-4 rounded-full bg-muted/50 mb-4">
        <Wallet className="h-8 w-8 text-muted-foreground" />
      </div>
      <h4 className="font-medium mb-1">No addresses yet</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Add a wallet address to start tracking rewards
      </p>
      <Button variant="outline" size="sm" onClick={onAddAddress}>
        <Plus className="h-4 w-4 mr-1" />
        Add your first address
      </Button>
    </div>
  );
}

export function AddressList({
  addresses,
  onAddAddress,
  onAddressRemoved,
}: AddressListProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [addressToRemove, setAddressToRemove] = useState<AddressData | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Calculate if the address being removed is the last verified one
  const verifiedCount = addresses.filter(a => a.verification_status === 'verified').length;
  const isLastVerified = addressToRemove?.verification_status === 'verified' && verifiedCount === 1;

  const handleRemoveClick = (address: AddressData) => {
    setAddressToRemove(address);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!addressToRemove) return;

    setIsRemoving(true);
    try {
      await api.deleteRewardAddress(addressToRemove.id);
      setRemoveDialogOpen(false);
      setAddressToRemove(null);
      onAddressRemoved();
    } catch (error) {
      console.error('Failed to remove address:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setAddressToRemove(null);
    }
    setRemoveDialogOpen(open);
  };

  // Group addresses by chain type
  const solanaAddresses = addresses.filter((a) => a.chain_type === 'solana');
  const evmAddresses = addresses.filter((a) => a.chain_type === 'evm');

  const addressCount = addresses.length;
  const isAtLimit = addressCount >= MAX_ADDRESSES;

  // Empty state
  if (addresses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Registered Addresses</h4>
          <span className="text-xs text-muted-foreground">0/{MAX_ADDRESSES} addresses</span>
        </div>
        <EmptyState onAddAddress={onAddAddress} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Registered Addresses</h4>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {addressCount}/{MAX_ADDRESSES} addresses
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddAddress}
            disabled={isAtLimit}
            title={isAtLimit ? 'Maximum addresses reached' : undefined}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Address
          </Button>
        </div>
      </div>

      {isAtLimit && (
        <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded">
          You've reached the maximum of {MAX_ADDRESSES} addresses. Remove one to add another.
        </p>
      )}

      <div className="space-y-4">
        {/* Solana Section */}
        {solanaAddresses.length > 0 && (
          <div className="space-y-2">
            <SectionHeader title="Solana Addresses" count={solanaAddresses.length} />
            <div className="space-y-2">
              {solanaAddresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onRemoveClick={handleRemoveClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Divider between sections if both have addresses */}
        {solanaAddresses.length > 0 && evmAddresses.length > 0 && (
          <div className="border-t border-border" />
        )}

        {/* EVM Section */}
        {evmAddresses.length > 0 && (
          <div className="space-y-2">
            <SectionHeader title="EVM Addresses" count={evmAddresses.length} />
            <div className="space-y-2">
              {evmAddresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onRemoveClick={handleRemoveClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <RemoveAddressDialog
        open={removeDialogOpen}
        onOpenChange={handleDialogClose}
        address={addressToRemove}
        isLastVerified={isLastVerified}
        onConfirm={handleConfirmRemove}
        isRemoving={isRemoving}
      />
    </div>
  );
}
