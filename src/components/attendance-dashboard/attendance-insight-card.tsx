import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AttendanceInsightCardProps {
  title: string;
  metricLabel: string;
  metricValue: string;
  tag: string;
  growth: string;
  growthDirection: 'up' | 'down';
  growthColor: 'green' | 'red';
}

export function AttendanceInsightCard({
  title,
  metricLabel,
  metricValue,
  tag,
  growth,
  growthDirection,
  growthColor,
}: AttendanceInsightCardProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Calendar className="size-3" />
            Today
          </Button>
        </div>

        <p className="text-muted-foreground text-sm">{metricLabel}</p>
        <div className="mb-4 flex items-center gap-2">
          <p className="text-3xl leading-none font-bold">{metricValue}</p>
          <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
            {tag}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex -space-x-2">
            {[0, 1, 2, 3].map(i => (
              <span
                key={i}
                className="border-border/50 bg-muted text-muted-foreground inline-flex size-6 items-center justify-center rounded-full border text-[10px]"
              >
                {String.fromCharCode(65 + i)}
              </span>
            ))}
            <span className="border-border/50 bg-background text-muted-foreground inline-flex size-6 items-center justify-center rounded-full border text-[10px]">
              +9
            </span>
          </div>

          <span
            className={cn(
              'rounded px-2 py-1 text-xs font-semibold',
              growthColor === 'green' && 'bg-emerald-500/20 text-emerald-400',
              growthColor === 'red' && 'bg-red-500/20 text-red-400'
            )}
          >
            {growthDirection === 'up' ? '↗' : '↘'} {growth}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
