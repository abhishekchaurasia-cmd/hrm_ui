import { OverviewStatCard } from './overview-stat-card';

import type { LucideIcon } from 'lucide-react';

export interface OverviewStatEmployee {
  name: string;
  initials: string;
}

export interface OverviewStatItem {
  title: string;
  value: string;
  delta: string;
  direction: 'up' | 'down';
  icon: LucideIcon;
  iconBg: string;
  employees?: OverviewStatEmployee[];
}

interface OverviewStatsProps {
  items: OverviewStatItem[];
}

export function OverviewStats({ items }: OverviewStatsProps) {
  return (
    <div>
      <p className="text-muted-foreground mb-3 text-sm font-semibold">
        Overview Statistics
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map(item => (
          <OverviewStatCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}
