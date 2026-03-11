'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
  RHFDateInput,
  RHFSelectInput,
  RHFToggleInput,
} from '@/features/admin/employee-profile/components/form-controls';

const TAX_REGIME_OPTIONS = [
  { value: 'old_regime', label: 'Old Regime' },
  { value: 'new_regime', label: 'New Regime (Section 115BAC)' },
];

interface CompensationFormProps {
  defaultValues?: CompensationFormValues;
  onSubmit: (data: CompensationFormValues) => void;
  formRef: React.RefObject<{ submit: () => void } | null>;
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'INR 0';
  return `INR ${amount.toLocaleString('en-IN')}`;
}

export function CompensationForm({
  defaultValues,
  onSubmit,
  formRef,
}: CompensationFormProps) {
  const form = useForm<CompensationFormValues>({
    resolver: zodResolver(compensationSchema),
    defaultValues: defaultValues ?? compensationDefaults,
  });

  const { control, handleSubmit, setValue } = form;

  const enablePayroll = useWatch({ control, name: 'enablePayroll' });
  const _annualSalary = useWatch({ control, name: 'annualSalary' });
  const regularSalary = useWatch({ control, name: 'regularSalary' });
  const bonus = useWatch({ control, name: 'bonus' });
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-8">
      <RHFToggleInput
        control={control}
        name="enablePayroll"
        label="Enable payroll for this employee"
      />

      {enablePayroll && (
        <>
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-6">
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <RHFNumberInput
                  control={control}
                  name="annualSalary"
                  label="Annual Salary"
                  placeholder="Enter amount"
                  min={0}
                />
                <RHFDateInput
                  control={control}
                  name="salaryEffectiveFrom"
                  label="Salary Effective From"
                />
              </div>

              <Separator />

              <section>
                <h3 className="mb-4 text-base font-semibold">Bonus Details</h3>

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
              </section>

              <Separator />

              <section>
                <h3 className="mb-4 text-base font-semibold">
                  Payroll Settings
                </h3>

                <div className="space-y-3">
                  <RHFToggleInput
                    control={control}
                    name="isEsiEligible"
                    label="ESI eligible"
                  />
                </div>

                <div className="mt-4 max-w-xs">
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

            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Salary Breakup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="text-muted-foreground text-xs uppercase">
                  Salary Effective From
                </div>
                <div className="text-sm font-medium">
                  {form.getValues('salaryEffectiveFrom') ?? '—'}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted-foreground text-xs uppercase">
                      Regular Salary
                    </div>
                    <div className="font-medium">
                      {formatCurrency(regularSalary)}
                    </div>
                  </div>
                  <span className="text-muted-foreground">+</span>
                  <div>
                    <div className="text-muted-foreground text-xs uppercase">
                      Bonus
                    </div>
                    <div className="font-medium">{formatCurrency(bonus)}</div>
                  </div>
                  <span className="text-muted-foreground">=</span>
                  <div>
                    <div className="text-muted-foreground text-xs uppercase">
                      Total
                    </div>
                    <div className="font-medium">
                      {formatCurrency((regularSalary ?? 0) + (bonus ?? 0))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {salaryComponents.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  Detailed Salary Breakup
                </h3>
                {breakup.length === 0 && (
                  <button
                    type="button"
                    onClick={handleAddComponents}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    + Load salary components
                  </button>
                )}
              </div>

              {breakup.length > 0 && (
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
              )}
            </section>
          )}
        </>
      )}
    </form>
  );
}
