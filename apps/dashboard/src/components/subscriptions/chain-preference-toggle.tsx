'use client';

import * as Switch from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

interface ChainPreferenceToggleProps {
  preference: 'base' | 'solana';
  onChange: (chain: 'base' | 'solana') => void;
  disabled?: boolean;
}

export function ChainPreferenceToggle({
  preference,
  onChange,
  disabled,
}: ChainPreferenceToggleProps) {
  // Solana = checked state (right side)
  const isSolana = preference === 'solana';

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <label className="text-sm font-medium text-muted-foreground">
        Preferred Chain
      </label>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            'text-sm font-medium transition-colors duration-200',
            !isSolana ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          Base
        </span>

        <Switch.Root
          checked={isSolana}
          onCheckedChange={(checked) => onChange(checked ? 'solana' : 'base')}
          disabled={disabled}
          className={cn(
            'relative inline-flex h-8 w-14 items-center rounded-full',
            'transition-colors duration-200 ease-in-out',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Blue for Base (unchecked), purple for Solana (checked)
            isSolana ? 'bg-purple-500' : 'bg-blue-500'
          )}
        >
          <Switch.Thumb
            className={cn(
              'pointer-events-none block h-6 w-6 rounded-full',
              'bg-white shadow-lg ring-0',
              'transition-transform duration-200 ease-in-out',
              isSolana ? 'translate-x-7' : 'translate-x-1'
            )}
          />
        </Switch.Root>

        <span
          className={cn(
            'text-sm font-medium transition-colors duration-200',
            isSolana ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          Solana
        </span>
      </div>

      <p className="text-xs text-muted-foreground mt-1">
        Used for automatic subscription payments
      </p>
    </div>
  );
}
