'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarHeader({ isCollapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-4">
      {!isCollapsed && (
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500">
            <span className="text-sm font-bold text-white">CD</span>
          </div>
          <span className="text-lg font-bold text-neutral-100">
            Copan<span className="text-orange-500">Digital</span>
          </span>
        </div>
      )}

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
