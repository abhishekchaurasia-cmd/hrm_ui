'use client';

import {
  CheckCircle2,
  Globe,
  Monitor,
  Smartphone,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import type { TimeTrackingPolicy } from '@/types/time-tracking-policy';

interface PolicySummaryTabProps {
  policy: TimeTrackingPolicy;
}

function StatusBadge({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <Badge variant="success" className="gap-1">
      <CheckCircle2 className="size-3" /> Allowed
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <XCircle className="size-3" /> Not Allowed
    </Badge>
  );
}

export function PolicySummaryTab({ policy }: PolicySummaryTabProps) {
  const { captureSettings, partialDaySettings } = policy;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="mb-3 text-base font-semibold">Capture Mode</h3>
        <div className="flex flex-col gap-2">
          {captureSettings.webClockIn.enabled && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-green-500" />
              <Monitor className="size-4" />
              <span>Web clock-in</span>
            </div>
          )}
          {captureSettings.remoteClockIn.enabled && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-green-500" />
              <Globe className="size-4" />
              <span>Remote clock-in (Captures Location)</span>
            </div>
          )}
          {captureSettings.mobileClockIn.enabled && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-green-500" />
              <Smartphone className="size-4" />
              <span>Mobile clock-in</span>
            </div>
          )}
          {captureSettings.biometricEnabled && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>Biometric device</span>
            </div>
          )}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-3 text-base font-semibold">Work from home</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground text-xs tracking-wider uppercase">
              Work from home
            </span>
            <div className="mt-1">
              <StatusBadge allowed={policy.wfhAllowed} />
            </div>
          </div>
          {policy.wfhAllowed && (
            <div>
              <span className="text-muted-foreground text-xs tracking-wider uppercase">
                Approval required
              </span>
              <div className="mt-1">
                {policy.wfhApprovalRequired ? 'Yes' : 'No'}
              </div>
            </div>
          )}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-3 text-base font-semibold">On duty</h3>
        <div className="text-sm">
          <span className="text-muted-foreground text-xs tracking-wider uppercase">
            On duty
          </span>
          <div className="mt-1">
            <StatusBadge allowed={policy.onDutyAllowed} />
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-3 text-base font-semibold">Partial work day</h3>
        {partialDaySettings.enabled ? (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs tracking-wider uppercase">
                Late arrival
              </span>
              <div className="mt-1">
                {partialDaySettings.lateArrival.enabled
                  ? `${partialDaySettings.lateArrival.maxMinutes} mins per request`
                  : 'Disabled'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs tracking-wider uppercase">
                Early leaving
              </span>
              <div className="mt-1">
                {partialDaySettings.earlyLeaving.enabled
                  ? `${partialDaySettings.earlyLeaving.maxMinutes} mins per request`
                  : 'Disabled'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs tracking-wider uppercase">
                Intervening time-off
              </span>
              <div className="mt-1">
                {partialDaySettings.interveningTimeOff.enabled
                  ? `${partialDaySettings.interveningTimeOff.maxMinutes} mins per request`
                  : 'Disabled'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs tracking-wider uppercase">
                Requests allowed
              </span>
              <div className="mt-1">
                {partialDaySettings.requestsAllowed} requests{' '}
                {partialDaySettings.requestsPeriod}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs tracking-wider uppercase">
                Approval required
              </span>
              <div className="mt-1">
                {partialDaySettings.approvalRequired ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Partial work day is not enabled.
          </p>
        )}
      </section>
    </div>
  );
}
