'use client';

import { Badge } from '@/components/ui/badge';

import { PenaltyRuleCard } from './penalty-rule-card';

import type { PenalizationPolicyVersion } from '@/types/penalization';

interface PolicySummaryTabProps {
  version: PenalizationPolicyVersion;
}

export function PolicySummaryTab({ version }: PolicySummaryTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-primary/5 border-primary/20 flex items-center gap-3 rounded-lg border p-4 text-sm">
        <span>
          Current Version: <strong>{version.effectiveFrom}</strong>
        </span>
        <Badge variant="outline">v{version.versionNumber}</Badge>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div className="bg-muted/50 rounded-lg p-4">
          <span className="text-muted-foreground">Deduction Method</span>
          <p className="mt-1 font-medium capitalize">
            {version.deductionMethod.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <span className="text-muted-foreground">Buffer Period</span>
          <p className="mt-1 font-medium">{version.bufferPeriodDays} day(s)</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Penalty Rules</h3>
        {version.rules && version.rules.length > 0 ? (
          version.rules.map(rule => (
            <PenaltyRuleCard key={rule.id} rule={rule} />
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            No rules configured for this version.
          </p>
        )}
      </div>
    </div>
  );
}
