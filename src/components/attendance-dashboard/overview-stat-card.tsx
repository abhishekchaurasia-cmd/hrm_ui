import { Card, CardContent } from '@/components/ui/card';

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
  icon: Icon,
  iconBg,
}: OverviewStatCardProps) {
  return (
    <Card className="py-0 transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${iconBg}18` }}
        >
          <Icon className="size-5" style={{ color: iconBg }} />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-xs font-medium">
            {title}
          </p>
          <p className="mt-0.5 text-2xl leading-none font-bold tracking-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
