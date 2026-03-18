'use client';

import { AlertTriangle, Clock, Hourglass, UserX } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useCreatePenalizationPolicy } from '../hooks/use-penalization-policies';

import type {
  CreatePenalizationPolicyDto,
  CreatePenalizationRuleDto,
  DeductionMethod,
  PenaltyType,
} from '@/types/penalization';

const PENALTY_OPTIONS: {
  type: PenaltyType;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    type: 'no_attendance',
    label: 'No Attendance',
    description: "Employee didn't have any attendance recorded for the day",
    icon: UserX,
  },
  {
    type: 'late_arrival',
    label: 'Late Arrival',
    description: "Employee's arrival is later than scheduled for the day",
    icon: Clock,
  },
  {
    type: 'work_hours_shortage',
    label: 'Work Hours Shortage',
    description: "Employee doesn't complete required work hours",
    icon: Hourglass,
  },
  {
    type: 'missing_swipes',
    label: 'Missing Attendance Logs',
    description: 'Employee has one or multiple swipes with missing entry/exit',
    icon: AlertTriangle,
  },
];

interface SetupPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = 'select' | 'configure' | 'deduction';

export function SetupPolicyDialog({
  open,
  onOpenChange,
  onSuccess,
}: SetupPolicyDialogProps) {
  const [step, setStep] = useState<Step>('select');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<PenaltyType>>(
    new Set()
  );
  const [ruleConfigs, setRuleConfigs] = useState<
    Record<
      PenaltyType,
      { deductionPerIncident: number; effectiveHoursPercentage: number }
    >
  >({
    no_attendance: { deductionPerIncident: 1, effectiveHoursPercentage: 90 },
    late_arrival: { deductionPerIncident: 0.25, effectiveHoursPercentage: 90 },
    work_hours_shortage: {
      deductionPerIncident: 0.25,
      effectiveHoursPercentage: 90,
    },
    missing_swipes: { deductionPerIncident: 0.5, effectiveHoursPercentage: 90 },
  });
  const [deductionMethod, setDeductionMethod] =
    useState<DeductionMethod>('loss_of_pay');
  const [bufferPeriodDays, setBufferPeriodDays] = useState(0);
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split('T')[0]
  );

  const createMutation = useCreatePenalizationPolicy();

  const resetForm = () => {
    setStep('select');
    setName('');
    setDescription('');
    setSelectedTypes(new Set());
    setDeductionMethod('loss_of_pay');
    setBufferPeriodDays(0);
    setEffectiveFrom(new Date().toISOString().split('T')[0]);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const toggleType = (type: PenaltyType) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const rules: CreatePenalizationRuleDto[] = PENALTY_OPTIONS.map(opt => ({
      penaltyType: opt.type,
      isEnabled: selectedTypes.has(opt.type),
      deductionPerIncident: ruleConfigs[opt.type].deductionPerIncident,
      ...(opt.type === 'work_hours_shortage' && {
        effectiveHoursPercentage:
          ruleConfigs[opt.type].effectiveHoursPercentage,
        thresholdType: 'percentage_based' as const,
      }),
      ...(opt.type === 'late_arrival' && {
        thresholdType: 'instance_based' as const,
        thresholdUnit: 'per_week',
      }),
    }));

    const dto: CreatePenalizationPolicyDto = {
      name,
      description: description || undefined,
      effectiveFrom,
      deductionMethod,
      bufferPeriodDays,
      rules,
    };

    createMutation.mutate(dto, {
      onSuccess: () => {
        handleClose();
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={val => !val && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle>Setup Penalization Policy</DialogTitle>
              <DialogDescription>What do you penalize for?</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Policy Name</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Work from Office"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Effective From</Label>
                  <Input
                    type="date"
                    value={effectiveFrom}
                    onChange={e => setEffectiveFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {PENALTY_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const selected = selectedTypes.has(opt.type);
                  return (
                    <button
                      type="button"
                      key={opt.type}
                      onClick={() => toggleType(opt.type)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div
                        className={`rounded-full p-2 ${
                          selected
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-muted-foreground text-xs">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep('configure')}
                disabled={selectedTypes.size === 0 || !name.trim()}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'configure' && (
          <>
            <DialogHeader>
              <DialogTitle>Configure Penalty Rules</DialogTitle>
              <DialogDescription>
                Set deduction amounts for each selected penalty type.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              {PENALTY_OPTIONS.filter(opt => selectedTypes.has(opt.type)).map(
                opt => (
                  <div
                    key={opt.type}
                    className="flex flex-col gap-2 rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-2">
                      <opt.icon className="text-muted-foreground size-4" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">
                          Deduction per incident (days)
                        </Label>
                        <Input
                          type="number"
                          step="0.25"
                          min="0"
                          max="30"
                          value={ruleConfigs[opt.type].deductionPerIncident}
                          onChange={e =>
                            setRuleConfigs(prev => ({
                              ...prev,
                              [opt.type]: {
                                ...prev[opt.type],
                                deductionPerIncident:
                                  parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                      {opt.type === 'work_hours_shortage' && (
                        <div>
                          <Label className="text-xs">
                            Effective hours threshold (%)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={
                              ruleConfigs[opt.type].effectiveHoursPercentage
                            }
                            onChange={e =>
                              setRuleConfigs(prev => ({
                                ...prev,
                                [opt.type]: {
                                  ...prev[opt.type],
                                  effectiveHoursPercentage:
                                    parseFloat(e.target.value) || 0,
                                },
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button onClick={() => setStep('deduction')}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === 'deduction' && (
          <>
            <DialogHeader>
              <DialogTitle>Penalty Deduction &amp; Buffer Period</DialogTitle>
              <DialogDescription>
                Configure how penalties are deducted and the buffer period.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-6">
              <div className="flex flex-1 flex-col gap-5">
                <div>
                  <Label className="mb-3 block text-sm font-medium">
                    How are penalties deducted?
                  </Label>
                  <div className="flex flex-col gap-3">
                    <label className="has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors">
                      <input
                        type="radio"
                        name="deductionMethod"
                        value="loss_of_pay"
                        checked={deductionMethod === 'loss_of_pay'}
                        onChange={() => setDeductionMethod('loss_of_pay')}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="text-sm font-medium">Loss of Pay</div>
                        <div className="text-muted-foreground text-xs">
                          Consider all penalties as loss of pay
                        </div>
                      </div>
                    </label>
                    <label className="has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors">
                      <input
                        type="radio"
                        name="deductionMethod"
                        value="paid_leave"
                        checked={deductionMethod === 'paid_leave'}
                        onChange={() => setDeductionMethod('paid_leave')}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="text-sm font-medium">Paid Leave</div>
                        <div className="text-muted-foreground text-xs">
                          Penalties are deducted from paid leave followed by
                          unpaid leave
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>
                    How many day(s) after the incident, should the penalty be
                    applied? (Buffer period)
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="90"
                      value={bufferPeriodDays}
                      onChange={e =>
                        setBufferPeriodDays(parseInt(e.target.value, 10) || 0)
                      }
                      className="w-24"
                    />
                    <span className="text-muted-foreground text-sm">
                      day(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 hidden w-64 flex-col gap-4 rounded-lg p-4 text-xs md:flex">
                <div>
                  <p className="mb-1 font-semibold">What is a Buffer period?</p>
                  <p className="text-muted-foreground">
                    The buffer period provides a grace window after an incident
                    before the penalty is formally applied. This allows HR to
                    review the case or the employee to submit a regularization
                    request.
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-semibold">
                    How order of paid leave works?
                  </p>
                  <p className="text-muted-foreground">
                    When &quot;Paid Leave&quot; is selected, penalties first
                    deduct from the employee&apos;s available paid leave
                    balance. If no paid leave is available, the deduction falls
                    back to loss of pay.
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-semibold">
                    How does policy effective date work?
                  </p>
                  <p className="text-muted-foreground">
                    The policy takes effect from the specified date. Attendance
                    incidents before this date will not be penalized under this
                    policy version.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('configure')}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Save'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
