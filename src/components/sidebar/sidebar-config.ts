import {
  CalendarDays,
  Clock,
  Shield,
  LayoutDashboard,
  Settings,
  User,
  ClipboardList,
  FileText,
  UserCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import type { UserRole } from '@/types/auth';

export type BadgeVariant = 'hot' | 'new';

export interface SidebarChildItem {
  id: string;
  label: string;
  href: string;
  badge?: { text: string; variant: BadgeVariant };
}

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: { text: string; variant: BadgeVariant };
  children?: SidebarChildItem[];
  roles?: UserRole[];
}

export interface SidebarMenuSection {
  title: string;
  items: SidebarMenuItem[];
}

export const sidebarConfig: SidebarMenuSection[] = [
  {
    title: 'MAIN MENU',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
      },
      {
        id: 'attendance-dashboard',
        label: 'Attendance',
        icon: Clock,
        href: '/dashboard/attendance',
      },
      {
        id: 'leave',
        label: 'Leave',
        icon: CalendarDays,
        href: '/dashboard/leave',
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: User,
        href: '/dashboard/profile',
      },
      {
        id: 'hr-dashboard',
        label: 'HR Dashboard',
        icon: Shield,
        href: '/dashboard/hr',
        roles: ['hr'],
      },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      {
        id: 'admin-shifts',
        label: 'Shifts',
        icon: ClipboardList,
        roles: ['hr'],
        children: [
          {
            id: 'shift-list',
            label: 'Manage Shifts',
            href: '/dashboard/admin/shifts',
          },
          {
            id: 'shift-assignments',
            label: 'Shift Assignments',
            href: '/dashboard/admin/shift-assignments',
          },
        ],
      },
      {
        id: 'admin-leave-plans',
        label: 'Leave Plans',
        icon: FileText,
        roles: ['hr'],
        children: [
          {
            id: 'leave-plan-list',
            label: 'Manage Plans',
            href: '/dashboard/admin/leave-plans',
          },
          {
            id: 'leave-assignments',
            label: 'Plan Assignments',
            href: '/dashboard/admin/leave-assignments',
          },
        ],
      },
      {
        id: 'admin-leave-balances',
        label: 'Leave Balances',
        icon: Wallet,
        roles: ['hr'],
        children: [
          {
            id: 'balance-overview',
            label: 'Overview',
            href: '/dashboard/admin/leave-balances',
          },
          {
            id: 'balance-transactions',
            label: 'Transactions',
            href: '/dashboard/admin/leave-balances/transactions',
          },
        ],
      },
      {
        id: 'admin-onboarding',
        label: 'Employee Setup',
        icon: UserCheck,
        href: '/dashboard/admin/employee-setup',
        roles: ['hr'],
      },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: '/dashboard/settings',
      },
    ],
  },
];
