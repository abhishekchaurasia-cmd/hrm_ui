'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { useUpdateTimeTrackingPolicy } from '../hooks/use-time-tracking-policies';

import type {
  AdjustmentSettings,
  ApprovalSettings,
  CaptureSettings,
  PartialDaySettings,
  RegularizationSettings,
  TimeTrackingPolicy,
  UpdateTimeTrackingPolicyDto,
} from '@/types/time-tracking-policy';

interface PolicyConfigDialogProps {
  policy: TimeTrackingPolicy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ConfigSection =
  | 'capture'
  | 'regularise'
  | 'adjustment'
  | 'partial'
  | 'approval';

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
          className="w-24"
        />
        {suffix && (
          <span className="text-muted-foreground text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PolicyConfigDialog({
  policy,
  open,
  onOpenChange,
}: PolicyConfigDialogProps) {
  const [activeSection, setActiveSection] = useState<ConfigSection>('capture');
  const [capture, setCapture] = useState<CaptureSettings>(
    policy.captureSettings
  );
  const [wfhAllowed, setWfhAllowed] = useState(policy.wfhAllowed);
  const [wfhApprovalRequired, setWfhApprovalRequired] = useState(
    policy.wfhApprovalRequired
  );
  const [onDutyAllowed, setOnDutyAllowed] = useState(policy.onDutyAllowed);
  const [partial, setPartial] = useState<PartialDaySettings>(
    policy.partialDaySettings
  );
  const [adjustment, setAdjustment] = useState<AdjustmentSettings>(
    policy.adjustmentSettings
  );
  const [regularization, setRegularization] = useState<RegularizationSettings>(
    policy.regularizationSettings
  );
  const [approval, setApproval] = useState<ApprovalSettings>(
    policy.approvalSettings
  );

  const updateMutation = useUpdateTimeTrackingPolicy(policy.id);

  const handleSave = () => {
    const dto: UpdateTimeTrackingPolicyDto = {
      captureSettings: capture,
      wfhAllowed,
      wfhApprovalRequired,
      onDutyAllowed,
      partialDaySettings: partial,
      adjustmentSettings: adjustment,
      regularizationSettings: regularization,
      approvalSettings: approval,
    };
    updateMutation.mutate(dto, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const sidebarItems: { key: ConfigSection; label: string }[] = [
    { key: 'capture', label: 'Capture Methods' },
    { key: 'regularise', label: 'Regularization' },
    { key: 'adjustment', label: 'Attendance Adjustment' },
    { key: 'partial', label: 'Partial Day' },
    { key: 'approval', label: 'Approval Settings' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Configure: {policy.name}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 overflow-hidden">
          <nav className="flex w-48 shrink-0 flex-col gap-1">
            {sidebarItems.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeSection === item.key
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div
            className="flex-1 overflow-y-auto pr-2"
            style={{ maxHeight: '60vh' }}
          >
            {activeSection === 'capture' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">Web clock-in</div>
                    <div className="text-muted-foreground text-sm">
                      Employees can log in via website and mark their attendance
                    </div>
                  </div>
                  <Toggle
                    checked={capture.webClockIn.enabled}
                    onChange={v =>
                      setCapture(prev => ({
                        ...prev,
                        webClockIn: { ...prev.webClockIn, enabled: v },
                      }))
                    }
                  />
                </div>
                {capture.webClockIn.enabled && (
                  <div className="ml-4 flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={capture.webClockIn.commentMandatory}
                        onChange={e =>
                          setCapture(prev => ({
                            ...prev,
                            webClockIn: {
                              ...prev.webClockIn,
                              commentMandatory: e.target.checked,
                            },
                          }))
                        }
                      />
                      Comment is mandatory at the time of first clock-in
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={capture.webClockIn.ipRestrictionEnabled}
                        onChange={e =>
                          setCapture(prev => ({
                            ...prev,
                            webClockIn: {
                              ...prev.webClockIn,
                              ipRestrictionEnabled: e.target.checked,
                            },
                          }))
                        }
                      />
                      Enable IP restriction
                    </label>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">Remote clock-in</div>
                    <div className="text-muted-foreground text-sm">
                      Captures location when employees clock in remotely
                    </div>
                  </div>
                  <Toggle
                    checked={capture.remoteClockIn.enabled}
                    onChange={v =>
                      setCapture(prev => ({
                        ...prev,
                        remoteClockIn: {
                          ...prev.remoteClockIn,
                          enabled: v,
                        },
                      }))
                    }
                  />
                </div>
                {capture.remoteClockIn.enabled && (
                  <div className="ml-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={capture.remoteClockIn.ipRestrictionEnabled}
                        onChange={e =>
                          setCapture(prev => ({
                            ...prev,
                            remoteClockIn: {
                              ...prev.remoteClockIn,
                              ipRestrictionEnabled: e.target.checked,
                            },
                          }))
                        }
                      />
                      Enable IP restriction
                    </label>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">Mobile clock-in</div>
                    <div className="text-muted-foreground text-sm">
                      Employees can mark attendance via mobile app
                    </div>
                  </div>
                  <Toggle
                    checked={capture.mobileClockIn.enabled}
                    onChange={v =>
                      setCapture(prev => ({
                        ...prev,
                        mobileClockIn: { enabled: v },
                      }))
                    }
                  />
                </div>

                <Separator />

                <h4 className="font-medium">Work from Home</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Allow work from home</span>
                  <Toggle checked={wfhAllowed} onChange={setWfhAllowed} />
                </div>
                {wfhAllowed && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Approval required</span>
                    <Toggle
                      checked={wfhApprovalRequired}
                      onChange={setWfhApprovalRequired}
                    />
                  </div>
                )}

                <Separator />

                <h4 className="font-medium">On Duty</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Allow on duty</span>
                  <Toggle checked={onDutyAllowed} onChange={setOnDutyAllowed} />
                </div>
              </div>
            )}

            {activeSection === 'adjustment' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold">
                    Attendance adjustment
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Employees can edit their logged time entries.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable attendance adjustment</span>
                  <Toggle
                    checked={adjustment.enabled}
                    onChange={v =>
                      setAdjustment(prev => ({ ...prev, enabled: v }))
                    }
                  />
                </div>
                {adjustment.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <NumberField
                      label="Employees can adjust attendance days"
                      value={adjustment.adjustmentEntries}
                      onChange={v =>
                        setAdjustment(prev => ({
                          ...prev,
                          adjustmentEntries: v,
                        }))
                      }
                      suffix="entries"
                    />
                    <SelectField
                      label="Entries in a"
                      value={adjustment.adjustmentPeriod}
                      onChange={v =>
                        setAdjustment(prev => ({
                          ...prev,
                          adjustmentPeriod: v as 'week' | 'month',
                        }))
                      }
                      options={[
                        { value: 'week', label: 'Week' },
                        { value: 'month', label: 'Month' },
                      ]}
                    />
                    <NumberField
                      label="Let employees adjust upto"
                      value={adjustment.pastDaysLimit}
                      onChange={v =>
                        setAdjustment(prev => ({
                          ...prev,
                          pastDaysLimit: v,
                        }))
                      }
                      suffix="days after end date"
                    />
                    <NumberField
                      label="Last date to adjust for past dates in a month"
                      value={adjustment.lastDateOfMonth}
                      onChange={v =>
                        setAdjustment(prev => ({
                          ...prev,
                          lastDateOfMonth: v,
                        }))
                      }
                      min={1}
                      max={31}
                    />
                  </div>
                )}
              </div>
            )}

            {activeSection === 'regularise' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold">
                    Attendance regularization
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Employees can raise a request to correct their attendance.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable regularization</span>
                  <Toggle
                    checked={regularization.enabled}
                    onChange={v =>
                      setRegularization(prev => ({ ...prev, enabled: v }))
                    }
                  />
                </div>
                {regularization.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <NumberField
                      label="Employees can regularize attendance days"
                      value={regularization.entries}
                      onChange={v =>
                        setRegularization(prev => ({
                          ...prev,
                          entries: v,
                        }))
                      }
                      suffix="entries"
                    />
                    <SelectField
                      label="Entries in a"
                      value={regularization.period}
                      onChange={v =>
                        setRegularization(prev => ({
                          ...prev,
                          period: v as 'week' | 'month',
                        }))
                      }
                      options={[
                        { value: 'week', label: 'Week' },
                        { value: 'month', label: 'Month' },
                      ]}
                    />
                    <NumberField
                      label="Let employees regularize upto"
                      value={regularization.pastDaysLimit}
                      onChange={v =>
                        setRegularization(prev => ({
                          ...prev,
                          pastDaysLimit: v,
                        }))
                      }
                      suffix="days after end date"
                    />
                    <NumberField
                      label="Last date to regularize for past dates"
                      value={regularization.lastDateOfMonth}
                      onChange={v =>
                        setRegularization(prev => ({
                          ...prev,
                          lastDateOfMonth: v,
                        }))
                      }
                      min={1}
                      max={31}
                    />
                    <div className="col-span-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={regularization.reasonRequired}
                          onChange={e =>
                            setRegularization(prev => ({
                              ...prev,
                              reasonRequired: e.target.checked,
                            }))
                          }
                        />
                        Employee is required to choose a reason for
                        regularization
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'partial' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold">Partial day</h3>
                  <p className="text-muted-foreground text-sm">
                    Employees can request permission for coming late, leaving
                    early or any time during the shift hours.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable partial day</span>
                  <Toggle
                    checked={partial.enabled}
                    onChange={v =>
                      setPartial(prev => ({ ...prev, enabled: v }))
                    }
                  />
                </div>
                {partial.enabled && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <SelectField
                        label="Set limits based on"
                        value={partial.limitUnit}
                        onChange={v =>
                          setPartial(prev => ({
                            ...prev,
                            limitUnit: v as 'minutes' | 'hours',
                          }))
                        }
                        options={[
                          { value: 'minutes', label: 'Minutes' },
                          { value: 'hours', label: 'Hours' },
                        ]}
                      />
                      <NumberField
                        label="Partial day is allowed for"
                        value={partial.limitValue}
                        onChange={v =>
                          setPartial(prev => ({
                            ...prev,
                            limitValue: v,
                          }))
                        }
                        suffix={partial.limitUnit}
                      />
                      <SelectField
                        label="Period"
                        value={partial.limitPeriod}
                        onChange={v =>
                          setPartial(prev => ({
                            ...prev,
                            limitPeriod: v as 'day' | 'week' | 'month',
                          }))
                        }
                        options={[
                          { value: 'day', label: 'Day' },
                          { value: 'week', label: 'Week' },
                          { value: 'month', label: 'Month' },
                        ]}
                      />
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={partial.lateArrival.enabled}
                          onChange={e =>
                            setPartial(prev => ({
                              ...prev,
                              lateArrival: {
                                ...prev.lateArrival,
                                enabled: e.target.checked,
                              },
                            }))
                          }
                        />
                        Late arrival or out of office
                      </label>
                      {partial.lateArrival.enabled && (
                        <div className="ml-6">
                          <NumberField
                            label="Max minutes per request"
                            value={partial.lateArrival.maxMinutes}
                            onChange={v =>
                              setPartial(prev => ({
                                ...prev,
                                lateArrival: {
                                  ...prev.lateArrival,
                                  maxMinutes: v,
                                },
                              }))
                            }
                            suffix="mins"
                          />
                        </div>
                      )}

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={partial.earlyLeaving.enabled}
                          onChange={e =>
                            setPartial(prev => ({
                              ...prev,
                              earlyLeaving: {
                                ...prev.earlyLeaving,
                                enabled: e.target.checked,
                              },
                            }))
                          }
                        />
                        Early departure of employees
                      </label>
                      {partial.earlyLeaving.enabled && (
                        <div className="ml-6">
                          <NumberField
                            label="Max minutes per request"
                            value={partial.earlyLeaving.maxMinutes}
                            onChange={v =>
                              setPartial(prev => ({
                                ...prev,
                                earlyLeaving: {
                                  ...prev.earlyLeaving,
                                  maxMinutes: v,
                                },
                              }))
                            }
                            suffix="mins"
                          />
                        </div>
                      )}

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={partial.interveningTimeOff.enabled}
                          onChange={e =>
                            setPartial(prev => ({
                              ...prev,
                              interveningTimeOff: {
                                ...prev.interveningTimeOff,
                                enabled: e.target.checked,
                              },
                            }))
                          }
                        />
                        During the shift (intervening time-off)
                      </label>
                      {partial.interveningTimeOff.enabled && (
                        <div className="ml-6">
                          <NumberField
                            label="Max minutes per request"
                            value={partial.interveningTimeOff.maxMinutes}
                            onChange={v =>
                              setPartial(prev => ({
                                ...prev,
                                interveningTimeOff: {
                                  ...prev.interveningTimeOff,
                                  maxMinutes: v,
                                },
                              }))
                            }
                            suffix="mins"
                          />
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <NumberField
                        label="Requests allowed"
                        value={partial.requestsAllowed}
                        onChange={v =>
                          setPartial(prev => ({
                            ...prev,
                            requestsAllowed: v,
                          }))
                        }
                      />
                      <SelectField
                        label="Period"
                        value={partial.requestsPeriod}
                        onChange={v =>
                          setPartial(prev => ({
                            ...prev,
                            requestsPeriod: v as 'monthly' | 'weekly',
                          }))
                        }
                        options={[
                          { value: 'monthly', label: 'Monthly' },
                          { value: 'weekly', label: 'Weekly' },
                        ]}
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={partial.commentMandatory}
                        onChange={e =>
                          setPartial(prev => ({
                            ...prev,
                            commentMandatory: e.target.checked,
                          }))
                        }
                      />
                      Comment is mandatory when raising request
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={partial.allowPastDated}
                        onChange={e =>
                          setPartial(prev => ({
                            ...prev,
                            allowPastDated: e.target.checked,
                          }))
                        }
                      />
                      Allow past dated requests
                    </label>
                    <NumberField
                      label="Requests can be made only"
                      value={partial.advanceDaysLimit}
                      onChange={v =>
                        setPartial(prev => ({
                          ...prev,
                          advanceDaysLimit: v,
                        }))
                      }
                      suffix="days in advance"
                    />
                  </div>
                )}
              </div>
            )}

            {activeSection === 'approval' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold">
                    Mandatory approval
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Send an approval request for regularization, adjustment &
                    partial day.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable mandatory approval</span>
                  <Toggle
                    checked={approval.enabled}
                    onChange={v =>
                      setApproval(prev => ({ ...prev, enabled: v }))
                    }
                  />
                </div>
                {approval.enabled && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <NumberField
                        label="Approval mandatory if requests exceed"
                        value={approval.thresholdCount}
                        onChange={v =>
                          setApproval(prev => ({
                            ...prev,
                            thresholdCount: v,
                          }))
                        }
                      />
                      <SelectField
                        label="Filter"
                        value={approval.thresholdPeriod}
                        onChange={v =>
                          setApproval(prev => ({
                            ...prev,
                            thresholdPeriod: v as 'all' | 'month',
                          }))
                        }
                        options={[
                          { value: 'all', label: 'All' },
                          { value: 'month', label: 'Month' },
                        ]}
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium">
                        Approval Levels
                      </Label>
                      {(approval.levels ?? []).map((level, index) => (
                        <div
                          key={index}
                          className="mt-2 flex items-center gap-3 rounded-lg border p-3"
                        >
                          <span className="text-muted-foreground text-sm">
                            Level {level.level}
                          </span>
                          <SelectField
                            label=""
                            value={level.assigneeType}
                            onChange={v => {
                              const newLevels = [...(approval.levels ?? [])];
                              newLevels[index] = {
                                ...newLevels[index],
                                assigneeType: v as
                                  | 'reporting_manager'
                                  | 'hr'
                                  | 'custom',
                              };
                              setApproval(prev => ({
                                ...prev,
                                levels: newLevels,
                              }));
                            }}
                            options={[
                              {
                                value: 'reporting_manager',
                                label: 'Reporting Manager',
                              },
                              { value: 'hr', label: 'HR' },
                              { value: 'custom', label: 'Custom' },
                            ]}
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          setApproval(prev => ({
                            ...prev,
                            levels: [
                              ...(prev.levels ?? []),
                              {
                                level: (prev.levels?.length ?? 0) + 1,
                                assigneeType: 'reporting_manager' as const,
                              },
                            ],
                          }))
                        }
                      >
                        + Add New Level
                      </Button>
                    </div>

                    <Separator />

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={approval.autoApproveIfMissing}
                        onChange={e =>
                          setApproval(prev => ({
                            ...prev,
                            autoApproveIfMissing: e.target.checked,
                          }))
                        }
                      />
                      Auto-approve if approver is missing
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={approval.skipApprovalForEveryRequest}
                        onChange={e =>
                          setApproval(prev => ({
                            ...prev,
                            skipApprovalForEveryRequest: e.target.checked,
                          }))
                        }
                      />
                      Do not send approvals for every request
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Discard Changes
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
