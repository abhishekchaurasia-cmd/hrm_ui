import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LeaveStat {
  label: string;
  value: number | string;
}

interface LeaveSummaryProps {
  title: string;
  year: string;
  stats: LeaveStat[];
  onApplyLeave?: () => void;
  hideApplyButton?: boolean;
  actionSlot?: React.ReactNode;
}

export function LeaveSummary({
  title,
  year,
  stats,
  onApplyLeave,
  hideApplyButton,
  actionSlot,
}: LeaveSummaryProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Calendar className="size-3" />
            {year}
          </Button>
        </div>

        <div className="mb-5 grid flex-1 grid-cols-2 gap-4">
          {stats.map(stat => (
            <div key={stat.label}>
              <p className="text-muted-foreground text-xs">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {!hideApplyButton && (
          <Button variant="outline" className="w-full" onClick={onApplyLeave}>
            Apply New Leave
          </Button>
        )}
        {actionSlot}
      </CardContent>
    </Card>
  );
}
