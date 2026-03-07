import { Clock, Monitor, Target, Timer } from 'lucide-react';

import { HoursStatCard } from './hours-stat-card';

export interface HoursStat {
  value: string;
  total: string;
  label: string;
  changePercent: string;
  changeLabel: string;
  changeDirection: 'up' | 'down';
}

interface HoursStatsProps {
  stats: HoursStat[];
}

const defaultIcons = [
  { icon: Clock, color: '#ef4444' },
  { icon: Monitor, color: '#6366f1' },
  { icon: Target, color: '#22c55e' },
  { icon: Timer, color: '#f97316' },
];

export function HoursStats({ stats }: HoursStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {stats.map((stat, i) => (
        <HoursStatCard
          key={stat.label}
          icon={defaultIcons[i % defaultIcons.length].icon}
          iconColor={defaultIcons[i % defaultIcons.length].color}
          value={stat.value}
          total={stat.total}
          label={stat.label}
          changePercent={stat.changePercent}
          changeLabel={stat.changeLabel}
          changeDirection={stat.changeDirection}
        />
      ))}
    </div>
  );
}
