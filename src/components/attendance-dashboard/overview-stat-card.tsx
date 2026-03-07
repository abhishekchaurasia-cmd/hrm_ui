import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { LucideIcon } from 'lucide-react';

interface OverviewStatCardProps {
  title: string;
  value: string;
  delta: string;
  direction: 'up' | 'down';
  icon: LucideIcon;
  iconBg: string;
}

export function OverviewStatCard({
  title,
  value,
  delta,
  direction,
  icon: Icon,
  iconBg,
}: OverviewStatCardProps) {
  return (
    <Card className="py-0">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-muted-foreground text-xs">{title}</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-2xl leading-none font-bold">{value}</p>
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-[11px] font-semibold',
                direction === 'up'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              )}
            >
              {direction === 'up' ? '↑' : '↓'} {delta}
            </span>
            <span className="text-muted-foreground text-[11px]">
              vs yesterday
            </span>
          </div>
        </div>

        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="size-4 text-white" />
        </div>
      </CardContent>
    </Card>
  );
}
