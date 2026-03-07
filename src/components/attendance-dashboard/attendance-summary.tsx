import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface SummaryItem {
  value: string;
  label: string;
}

interface AttendanceSummaryProps {
  items: SummaryItem[];
  avgWorkingHoursPercent: number;
}

export function AttendanceSummary({
  items,
  avgWorkingHoursPercent,
}: AttendanceSummaryProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Attendance Summary</h3>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Calendar className="size-3" />
            Today
          </Button>
        </div>

        <p className="text-muted-foreground text-sm">Avg Working Hours</p>
        <div className="bg-muted mt-2 mb-2 h-2 rounded-full">
          <div
            className="h-2 rounded-full bg-neutral-700 dark:bg-neutral-300"
            style={{ width: `${Math.min(avgWorkingHoursPercent, 100)}%` }}
          />
        </div>
        <p className="text-muted-foreground mb-4 text-xs">
          {avgWorkingHoursPercent.toFixed(1)}% of expected hours
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {items.map(item => (
            <div
              key={item.label}
              className="border-border/30 bg-background rounded-lg border px-3 py-4 text-center"
            >
              <p className="text-3xl leading-none font-bold">{item.value}</p>
              <p className="text-muted-foreground mt-1 text-xs">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
