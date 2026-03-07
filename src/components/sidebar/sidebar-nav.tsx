import { cn } from '@/lib/utils';

import { SidebarMenuItem } from './sidebar-menu-item';

import type { SidebarMenuSection } from './sidebar-config';
import type { UserRole } from '@/types/auth';

interface SidebarNavProps {
  sections: SidebarMenuSection[];
  isCollapsed: boolean;
  currentRole: UserRole;
}

export function SidebarNav({
  sections,
  isCollapsed,
  currentRole,
}: SidebarNavProps) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {sections.map(section => (
        <div key={section.title}>
          {!isCollapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-neutral-500">
              {section.title}
            </p>
          )}

          {isCollapsed && (
            <div
              className={cn(
                'mb-2 border-t border-neutral-800',
                'first:border-t-0'
              )}
            />
          )}

          <div className="space-y-1">
            {section.items
              .filter(item => {
                if (!item.roles || item.roles.length === 0) {
                  return true;
                }
                return item.roles.includes(currentRole);
              })
              .map(item => (
                <SidebarMenuItem
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
