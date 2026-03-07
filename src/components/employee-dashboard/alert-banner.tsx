'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface AlertBannerProps {
  message: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

export function AlertBanner({
  message,
  variant = 'success',
}: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm',
        variant === 'success' &&
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        variant === 'warning' &&
          'border-amber-500/30 bg-amber-500/10 text-amber-400',
        variant === 'error' && 'border-red-500/30 bg-red-500/10 text-red-400',
        variant === 'info' && 'border-blue-500/30 bg-blue-500/10 text-blue-400'
      )}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-4 shrink-0 rounded p-0.5 transition-colors hover:bg-white/10"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
