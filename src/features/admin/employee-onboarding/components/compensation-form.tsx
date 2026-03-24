'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSalaryComponentsList } from '@/features/admin/employee-onboarding/hooks/use-onboarding-options';
import {
  compensationSchema,
  compensationDefaults,
  type CompensationFormValues,
} from '@/features/admin/employee-onboarding/schema/onboarding.schema';
import {
  RHFNumberInput,
  RHFSelectInput,
  RHFToggleInput,
} from '@/features/admin/employee-profile/components/form-controls';

const TAX_REGIME_OPTIONS = [
  { value: 'old_regime', label: 'Old Regime' },
  { value: 'new_regime', label: 'New Regime (Section 115BAC)' },
];

const PAY_GROUP_OPTIONS = [{ value: 'default', label: 'Default pay group' }];

const SALARY_PERIOD_OPTIONS = [
  { value: 'per_annum', label: 'Per annum' },
  { value: 'per_month', label: 'Per month' },
];

const SALARY_STRUCTURE_OPTIONS = [
  { value: 'range_based', label: 'Range Based' },
  { value: 'fixed', label: 'Fixed' },
];

interface CompensationFormProps {
  defaultValues?: CompensationFormValues;
  onSubmit: (data: CompensationFormValues) => void;
  formRef: React.RefObject<{ submit: () => void } | null>;
  joiningDate?: string | null;
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'INR 0';
  return `INR ${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function CompensationForm({
  defaultValues,
  onSubmit,
  formRef,
  joiningDate,
}: CompensationFormProps) {
  const effectiveDate = joiningDate ?? new Date().toISOString().split('T')[0];

  const form = useForm<CompensationFormValues>({
    resolver: zodResolver(compensationSchema),
    defaultValues: {
      ...(defaultValues ?? compensationDefaults),
      salaryEffectiveFrom: defaultValues?.salaryEffectiveFrom ?? effectiveDate,
    },
  });

  const { control, handleSubmit, setValue } = form;

  const enablePayroll = useWatch({ control, name: 'enablePayroll' });
  const annualSalary = useWatch({ control, name: 'annualSalary' });
  const salaryPeriod = useWatch({ control, name: 'salaryPeriod' });
  const regularSalary = useWatch({ control, name: 'regularSalary' });
  const bonus = useWatch({ control, name: 'bonus' });
  const bonusIncludedInCtc = useWatch({ control, name: 'bonusIncludedInCtc' });
  const salaryEffectiveFrom = useWatch({
    control,
    name: 'salaryEffectiveFrom',
  });
  const showDetailedBreakup = useWatch({
    control,
    name: 'showDetailedBreakup',
  });
  const breakup = useWatch({ control, name: 'breakup' }) ?? [];

  const { data: salaryComponents = [] } = useSalaryComponentsList();

  useEffect(() => {
    if (formRef) {
      formRef.current = {
        submit: () => {
          void handleSubmit(onSubmit)();
        },
      };
    }
  }, [formRef, handleSubmit, onSubmit]);

  useEffect(() => {
    if (joiningDate) {
      setValue('salaryEffectiveFrom', joiningDate);
    }
  }, [joiningDate, setValue]);

  const computedAnnual =
    salaryPeriod === 'per_month'
      ? (annualSalary ?? 0) * 12
      : (annualSalary ?? 0);

  useEffect(() => {
    if (!bonusIncludedInCtc) {
      setValue('regularSalary', computedAnnual);
    }
  }, [computedAnnual, bonusIncludedInCtc, setValue]);

  const totalCompensation = (regularSalary ?? 0) + (bonus ?? 0);

  const handleAddBonus = () => {
    if (!bonus) {
      setValue('bonus', 0);
    }
  };

  const handleAddComponents = () => {
    if (salaryComponents.length === 0) return;

    const existingIds = new Set(breakup.map(b => b.salaryComponentId));
    const newItems = salaryComponents
      .filter(c => !existingIds.has(c.id))
      .map(c => ({
        salaryComponentId: c.id,
        annualAmount: 0,
      }));

    if (newItems.length > 0) {
      setValue('breakup', [...breakup, ...newItems]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-8">
      <RHFToggleInput
        control={control}
        name="enablePayroll"
        label="Enable payroll for this employee"
      />

      {enablePayroll && (
        <>
          <div className="flex gap-6">
            <div className="min-w-0 flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <RHFSelectInput
                  control={control}
                  name="payGroup"
                  label="Pay Group"
                  placeholder="Default pay group"
                  options={PAY_GROUP_OPTIONS}
                  allowClear
                />
                <div className="space-y-2">
                  <Label>Annual Salary</Label>
                  <div className="flex gap-2">
                    <Controller
                      control={control}
                      name="annualSalary"
                      render={({ field }) => (
                        <Input
                          type="number"
                          min={0}
                          className="min-w-0 flex-1"
                          placeholder="Enter amount"
                          value={field.value ?? ''}
                          onChange={e =>
                            field.onChange(
                              e.target.value === ''
                                ? null
                                : Number(e.target.value)
                            )
                          }
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="salaryPeriod"
                      render={({ field }) => (
                        <select
                          className="border-input bg-background shrink-0 rounded-md border px-3 py-2 text-sm"
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                        >
                          {SALARY_PERIOD_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <section>
                <h3 className="mb-4 text-base font-semibold">Bonus Details</h3>

                <Controller
                  control={control}
                  name="bonusIncludedInCtc"
                  render={({ field }) => (
                    <div className="mb-4 flex items-center space-x-2">
                      <Checkbox
                        id="bonusIncludedInCtc"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="bonusIncludedInCtc"
                        className="text-sm leading-none"
                      >
                        Bonus amount is included in the annual salary of{' '}
                        {formatCurrency(computedAnnual)}
                      </label>
                    </div>
                  )}
                />

                <button
                  type="button"
                  onClick={handleAddBonus}
                  className="text-primary mb-4 text-sm font-medium hover:underline"
                >
                  + Add Bonus
                </button>

                {bonus !== null && bonus !== undefined && (
                  <div className="grid grid-cols-2 gap-4">
                    <RHFNumberInput
                      control={control}
                      name="regularSalary"
                      label="Regular Salary"
                      placeholder="0"
                      min={0}
                    />
                    <RHFNumberInput
                      control={control}
                      name="bonus"
                      label="Bonus"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                )}
              </section>

              <Separator />

              <section>
                <h3 className="mb-4 text-base font-semibold">
                  Payroll Settings
                </h3>

                <div className="flex items-center gap-6">
                  <Controller
                    control={control}
                    name="isPfEligible"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isPfEligible"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label
                          htmlFor="isPfEligible"
                          className="text-sm leading-none"
                        >
                          Provident fund (PF) eligible
                        </label>
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="isEsiEligible"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isEsiEligible"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label
                          htmlFor="isEsiEligible"
                          className="text-sm leading-none"
                        >
                          ESI eligible
                        </label>
                      </div>
                    )}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <RHFSelectInput
                    control={control}
                    name="salaryStructureType"
                    label="Salary Structure Type"
                    placeholder="Select type"
                    options={SALARY_STRUCTURE_OPTIONS}
                    allowClear
                  />
                  <RHFSelectInput
                    control={control}
                    name="taxRegime"
                    label="Tax Regime to Consider"
                    placeholder="Select regime"
                    options={TAX_REGIME_OPTIONS}
                    allowClear
                  />
                </div>
              </section>
            </div>

            <Card className="h-fit w-72 shrink-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Salary Breakup</CardTitle>
                  <Controller
                    control={control}
                    name="showDetailedBreakup"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Label className="text-muted-foreground text-xs">
                          Detailed breakup
                        </Label>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs uppercase">
                    Salary Effective From
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {formatDate(salaryEffectiveFrom)}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs uppercase">
                      Regular Salary
                    </div>
                    <div className="font-medium">
                      {formatCurrency(regularSalary)}
                    </div>
                  </div>
                  <span className="text-muted-foreground">+</span>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs uppercase">
                      Bonus
                    </div>
                    <div className="font-medium">{formatCurrency(bonus)}</div>
                  </div>
                  <span className="text-muted-foreground">=</span>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs uppercase">
                      Total
                    </div>
                    <div className="font-medium">
                      {formatCurrency(totalCompensation)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {showDetailedBreakup && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  Detailed Salary Breakup
                </h3>
                {breakup.length === 0 && salaryComponents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddComponents}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    + Load salary components
                  </button>
                )}
              </div>

              {breakup.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">
                        Annual Amount
                      </TableHead>
                      <TableHead className="text-right">
                        Monthly Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakup.map((item, index) => {
                      const component = salaryComponents.find(
                        c => c.id === item.salaryComponentId
                      );
                      return (
                        <TableRow key={item.salaryComponentId}>
                          <TableCell className="font-medium">
                            {component?.name ?? 'Unknown'}
                          </TableCell>
                          <TableCell className="capitalize">
                            {component?.componentType ?? '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Controller
                              control={control}
                              name={`breakup.${index}.annualAmount`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  min={0}
                                  className="ml-auto w-32 text-right"
                                  value={field.value ?? ''}
                                  onChange={e =>
                                    field.onChange(
                                      e.target.value === ''
                                        ? 0
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right">
                            {formatCurrency(
                              Math.round((item.annualAmount ?? 0) / 12)
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  {salaryComponents.length === 0
                    ? 'No salary components configured. Create them in compensation settings.'
                    : 'Click "Load salary components" to populate the breakup.'}
                </p>
              )}
            </section>
          )}
        </>
      )}
    </form>
  );
}
