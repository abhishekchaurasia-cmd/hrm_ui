'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { SidebarBadge } from './sidebar-badge';

import type { SidebarMenuItem as MenuItemType } from './sidebar-config';
import type { UserRole } from '@/types/auth';

interface SidebarMenuItemProps {
  item: MenuItemType;
  isCollapsed: boolean;
  currentRole: UserRole;
}

export function SidebarMenuItem({
  item,
  isCollapsed,
  currentRole,
}: SidebarMenuItemProps) {
  const pathname = usePathname();
  const visibleChildren = item.children?.filter(child => {
    if (!child.roles || child.roles.length === 0) return true;
    return child.roles.includes(currentRole);
  });
  const hasChildren = visibleChildren && visibleChildren.length > 0;

  const isChildActive = hasChildren
    ? visibleChildren!.some(child => pathname === child.href)
    : false;
  const isActive = item.href ? pathname === item.href : isChildActive;

  const [isOpen, setIsOpen] = useState(isChildActive);

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200',
            (isOpen || isActive) && 'bg-neutral-800/60 text-neutral-200'
          )}
        >
          <item.icon className="size-5 shrink-0" />

          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <SidebarBadge
                  text={item.badge.text}
                  variant={item.badge.variant}
                />
              )}
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </>
          )}
        </button>

        {!isCollapsed && isOpen && (
          <div className="relative mt-1 ml-[22px] border-l border-neutral-700 pl-4">
            {visibleChildren!.map(child => {
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.id}
                  href={child.href}
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                    'text-neutral-400 hover:text-neutral-200',
                    childActive &&
                      '-ml-[17px] border-l-2 border-blue-500 pl-[15px] text-blue-400'
                  )}
                >
                  <span>{child.label}</span>
                  {child.badge && (
                    <SidebarBadge
                      text={child.badge.text}
                      variant={child.badge.variant}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const content = (
    <Link
      href={item.href ?? '#'}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200',
        isActive && 'bg-neutral-800/60 text-blue-400'
      )}
    >
      <item.icon className="size-5 shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <SidebarBadge text={item.badge.text} variant={item.badge.variant} />
          )}
        </>
      )}
    </Link>
  );

  return content;
}
