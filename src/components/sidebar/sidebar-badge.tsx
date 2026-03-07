import { cn } from '@/lib/utils';

import type { BadgeVariant } from './sidebar-config';

interface SidebarBadgeProps {
  text: string;
  variant: BadgeVariant;
}

export function SidebarBadge({ text, variant }: SidebarBadgeProps) {
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white',
        variant === 'hot' && 'bg-orange-500',
        variant === 'new' && 'bg-red-500'
      )}
    >
      {text}
    </span>
  );
}
