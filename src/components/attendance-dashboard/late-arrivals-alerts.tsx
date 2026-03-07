import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { LateArrivalRow, type LateArrivalItem } from './late-arrival-row';

interface LateArrivalsAlertsProps {
  items: LateArrivalItem[];
}

export function LateArrivalsAlerts({ items }: LateArrivalsAlertsProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">
            Late Arrivals &amp; Alerts
          </h3>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Calendar className="size-3" />
            Today
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No late arrivals today
          </p>
        ) : (
          <div className="space-y-2.5">
            {items.map(person => (
              <LateArrivalRow key={person.name} {...person} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
