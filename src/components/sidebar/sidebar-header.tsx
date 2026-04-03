'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { CopanLogo } from '@/components/icons/copan-logo';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarHeader({ isCollapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-4">
      {!isCollapsed && <CopanLogo className="h-8 w-auto text-white" />}

      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200',
          isCollapsed && 'mx-auto'
        )}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <PanelLeftClose className="size-5" />
        )}
      </button>
    </div>
  );
}
