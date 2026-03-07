'use client';

import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface AttendanceStatusItem {
  label: string;
  value: number;
  color: string;
}

interface AttendanceStatusProps {
  statusData: AttendanceStatusItem[];
  totalWorkingDays: number;
}

export function AttendanceStatus({
  statusData,
  totalWorkingDays,
}: AttendanceStatusProps) {
  const total = statusData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className="h-full py-0">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Attendance Status</h3>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Calendar className="size-3" />
            Today
          </Button>
        </div>

        <p className="text-muted-foreground text-xs">Total Employees</p>
        <p className="mb-4 text-3xl font-bold">
          {totalWorkingDays.toLocaleString()}
        </p>

        {total > 0 && (
          <div className="mb-4 flex h-8 overflow-hidden rounded-md">
            {statusData.map(item => (
              <div
                key={item.label}
                style={{
                  width: `${(item.value / total) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            ))}
          </div>
        )}

        <div className="space-y-2.5">
          {statusData.map(item => (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
