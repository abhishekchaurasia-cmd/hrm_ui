import { ArrowDown, ArrowUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { LucideIcon } from 'lucide-react';

interface HoursStatCardProps {
  icon: LucideIcon;
  iconColor: string;
  value: string;
  total: string;
  label: string;
  changePercent: string;
  changeLabel: string;
  changeDirection: 'up' | 'down';
}

export function HoursStatCard({
  icon: Icon,
  iconColor,
  value,
  total,
  label,
  changePercent,
  changeLabel,
  changeDirection,
}: HoursStatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{value}</span>
              <span className="text-muted-foreground text-sm">/ {total}</span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
          </div>
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <Icon className="size-4" style={{ color: iconColor }} />
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span
            className={cn(
              'flex items-center gap-0.5 font-medium',
              changeDirection === 'up' ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {changeDirection === 'up' ? (
              <ArrowUp className="size-3" />
            ) : (
              <ArrowDown className="size-3" />
            )}
            {changePercent}
          </span>
          <span className="text-muted-foreground">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
