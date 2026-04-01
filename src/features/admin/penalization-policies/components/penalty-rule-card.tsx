'use client';

import { AlertTriangle, Clock, Hourglass, UserX } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { PenalizationRule, PenaltyType } from '@/types/penalization';

const PENALTY_CONFIG: Record<
  PenaltyType,
  {
    label: string;
    description: string;
    icon: React.ElementType;
  }
> = {
  no_attendance: {
    label: 'No Attendance',
    description: "Employee didn't have any attendance recorded for the day",
    icon: UserX,
  },
  late_arrival: {
    label: 'Late Arrival',
    description: "Employee's arrival is later than scheduled for the day",
    icon: Clock,
  },
  work_hours_shortage: {
    label: 'Work Hours Shortage',
    description: "Employee doesn't complete required work hours",
    icon: Hourglass,
  },
  missing_swipes: {
    label: 'Missing Attendance Logs',
    description: 'Employee has one or multiple swipes with missing entry/exit',
    icon: AlertTriangle,
  },
};

interface PenaltyRuleCardProps {
  rule: PenalizationRule;
}

export function PenaltyRuleCard({ rule }: PenaltyRuleCardProps) {
  const config = PENALTY_CONFIG[rule.penaltyType];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="text-muted-foreground size-5" />
            {config.label}
          </CardTitle>
          <Badge variant={rule.isEnabled ? 'success' : 'secondary'}>
            {rule.isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>
      {rule.isEnabled && (
        <CardContent>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <span className="text-muted-foreground">
                Deduction per incident
              </span>
              <p className="font-medium">
                {Number(rule.deductionPerIncident)} day(s) leave
              </p>
            </div>

            {rule.thresholdType && (
              <div>
                <span className="text-muted-foreground">Threshold</span>
                <p className="font-medium">
                  {rule.thresholdType === 'instance_based'
                    ? 'Instance Based'
                    : 'Percentage Based'}
                  {rule.thresholdValue !== null &&
                    rule.thresholdValue !== undefined &&
                    ` — ${rule.thresholdValue}`}
                  {rule.thresholdUnit &&
                    ` ${rule.thresholdUnit.replace(/_/g, ' ')}`}
                </p>
              </div>
            )}

            {rule.minInstancesBeforePenalty !== null &&
              rule.minInstancesBeforePenalty !== undefined && (
                <div>
                  <span className="text-muted-foreground">
                    Min instances before penalty
                  </span>
                  <p className="font-medium">
                    {rule.minInstancesBeforePenalty} instance(s)
                  </p>
                </div>
              )}

            {rule.effectiveHoursPercentage !== null &&
              rule.effectiveHoursPercentage !== undefined && (
                <div>
                  <span className="text-muted-foreground">
                    Effective hours threshold
                  </span>
                  <p className="font-medium">
                    Below {Number(rule.effectiveHoursPercentage)}%
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export { PENALTY_CONFIG };
