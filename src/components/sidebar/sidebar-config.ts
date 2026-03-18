import {
  CalendarDays,
  Clock,
  Globe,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Timer,
  User,
  ClipboardList,
  FileCheck,
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
        roles: ['employee'],
      },
      {
        id: 'my-holidays',
        label: 'Holidays',
        icon: Globe,
        href: '/my/holidays',
        roles: ['employee'],
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: User,
        href: '/dashboard/profile',
        roles: ['employee'],
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
        id: 'admin-time-tracking',
        label: 'Time Tracking',
        icon: Timer,
        href: '/dashboard/admin/time-tracking-policies',
        roles: ['hr'],
      },
      {
        id: 'admin-penalization',
        label: 'Penalization',
        icon: ShieldAlert,
        roles: ['hr'],
        children: [
          {
            id: 'penalization-list',
            label: 'Manage Policies',
            href: '/dashboard/admin/penalization-policies',
          },
          {
            id: 'penalization-assignments',
            label: 'Policy Assignments',
            href: '/dashboard/admin/penalization-policies/assignments',
          },
        ],
      },
      {
        id: 'admin-leave-requests',
        label: 'Leave Requests',
        icon: FileCheck,
        href: '/dashboard/admin/leave-requests',
        roles: ['hr'],
      },
      {
        id: 'admin-holidays',
        label: 'Holidays',
        icon: Globe,
        href: '/settings/holidays',
        roles: ['hr'],
      },
      {
        id: 'admin-onboarding',
        label: 'Employee Onboarding',
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
