import { Card, CardContent } from '@/components/ui/card';

export interface TimelineStat {
  label: string;
  value: string;
  color: string;
}

export interface TimelineBar {
  segments: { color: string; widthPercent: number }[];
}

interface WorkTimelineProps {
  stats: TimelineStat[];
  bars: TimelineBar[];
}

export function WorkTimeline({ stats, bars }: WorkTimelineProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label}>
              <div className="mb-1 flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: stat.color }}
                />
                <span className="text-muted-foreground text-xs">
                  {stat.label}
                </span>
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {bars.length > 0 && (
          <div className="space-y-3">
            {bars.map((bar, barIdx) => (
              <div
                key={barIdx}
                className="flex h-6 gap-1 overflow-hidden rounded"
              >
                {bar.segments.map((seg, segIdx) => (
                  <div
                    key={segIdx}
                    className="rounded"
                    style={{
                      backgroundColor: seg.color,
                      width: `${seg.widthPercent}%`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
