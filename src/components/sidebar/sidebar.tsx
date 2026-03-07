'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';

import { sidebarConfig } from './sidebar-config';
import { SidebarHeader } from './sidebar-header';
import { SidebarNav } from './sidebar-nav';

import type { UserRole } from '@/types/auth';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentRole: UserRole = (session?.user?.role as UserRole) ?? 'employee';
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar } =
    useSidebar();

  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  return (
    <>
      <aside
        className={cn(
          'hidden h-screen flex-col bg-neutral-950 transition-[width] duration-300 lg:flex',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarHeader isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        <SidebarNav
          sections={sidebarConfig}
          isCollapsed={isCollapsed}
          currentRole={currentRole}
        />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/60"
            onClick={closeMobileSidebar}
          />
          <aside className="relative z-10 flex h-full w-72 flex-col bg-neutral-950 shadow-xl">
            <SidebarHeader isCollapsed={false} onToggle={closeMobileSidebar} />
            <SidebarNav
              sections={sidebarConfig}
              isCollapsed={false}
              currentRole={currentRole}
            />
          </aside>
        </div>
      )}
    </>
  );
}
