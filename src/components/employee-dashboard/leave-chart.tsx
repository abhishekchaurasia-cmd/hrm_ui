import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LeaveChartItem {
  label: string;
  value: number;
  color: string;
}

interface LeaveChartProps {
  title: string;
  year: string;
  items: LeaveChartItem[];
  comparisonText?: string;
}

function DonutChart({ items }: { items: LeaveChartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const circles = items.reduce<
    Array<{ item: LeaveChartItem; strokeLength: number; offset: number }>
  >((acc, item) => {
    const strokeLength = total > 0 ? (item.value / total) * circumference : 0;
    const offset = acc.reduce((sum, curr) => sum + curr.strokeLength, 0);
    return [...acc, { item, strokeLength, offset }];
  }, []);

  return (
    <svg viewBox="0 0 160 160" className="size-40">
      {circles.map(({ item, strokeLength, offset }) => (
        <circle
          key={item.label}
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={item.color}
          strokeWidth="20"
          strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
          strokeDashoffset={-offset}
          transform="rotate(-90 80 80)"
        />
      ))}
    </svg>
  );
}

export function LeaveChart({
  title,
  year,
  items,
  comparisonText,
}: LeaveChartProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Calendar className="size-3" />
            {year}
          </Button>
        </div>

        <div className="flex items-center gap-6">
          <div className="space-y-2.5">
            {items.map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground text-sm">
                  <span className="text-foreground font-medium">
                    {item.value}
                  </span>{' '}
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="shrink-0">
            <DonutChart items={items} />
          </div>
        </div>

        {comparisonText && (
          <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full bg-blue-400" />
            {comparisonText}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
