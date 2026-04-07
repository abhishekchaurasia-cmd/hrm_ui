'use client';

import { Calendar, ChevronRight, Home, Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface AttendanceHeaderProps {
  showApplyLeave?: boolean;
}

function getCurrentMonthYear(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function AttendanceHeader({
  showApplyLeave = true,
}: AttendanceHeaderProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Attendance Dashboard
        </h1>
        <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
          <Home className="size-3.5" />
          <ChevronRight className="size-3" />
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="size-3" />
          <span>Attendance Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Calendar className="size-3.5" />
          {getCurrentMonthYear()}
        </Button>
        {showApplyLeave && (
          <Button
            asChild
            size="sm"
            className="gap-1.5 bg-orange-500 text-white hover:bg-orange-600"
          >
            <Link href="/dashboard/leave?apply=true">
              <Plus className="size-3.5" />
              Apply Leave
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
