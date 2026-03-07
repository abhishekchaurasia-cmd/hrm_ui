'use client';

import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createLeavePlan } from '@/services/leave-plans';

import type { CreateLeavePlanDto } from '@/types/leave';

export function LeavePlanCreateScreen() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CreateLeavePlanDto>({
    name: '',
    year: currentYear,
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
    description: '',
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name || form.name.length < 2)
      newErrors.name = 'Name must be at least 2 characters';
    if (!form.year || form.year < 2020 || form.year > 2100)
      newErrors.year = 'Year must be between 2020 and 2100';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.endDate <= form.startDate)
      newErrors.endDate = 'End date must be after start date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await createLeavePlan(form);
      toast.success(res.message);
      router.push('/dashboard/admin/leave-plans');
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to create leave plan')
        : 'Failed to create leave plan';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/admin/leave-plans')}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create Leave Plan</h1>
          <p className="text-muted-foreground text-sm">
            Define a new annual leave policy
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                placeholder="e.g. Leave Plan 2026"
                value={form.name}
                onChange={e => {
                  setForm(p => ({ ...p, name: e.target.value }));
                  if (errors.name) setErrors(p => ({ ...p, name: '' }));
                }}
              />
              {errors.name && (
                <p className="text-destructive text-xs">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min={2020}
                max={2100}
                value={form.year}
                onChange={e => {
                  const year = parseInt(e.target.value, 10) || currentYear;
                  setForm(p => ({
                    ...p,
                    year,
                    startDate: `${year}-01-01`,
                    endDate: `${year}-12-31`,
                  }));
                  if (errors.year) setErrors(p => ({ ...p, year: '' }));
                }}
              />
              {errors.year && (
                <p className="text-destructive text-xs">{errors.year}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={e => {
                    setForm(p => ({ ...p, startDate: e.target.value }));
                    if (errors.startDate)
                      setErrors(p => ({ ...p, startDate: '' }));
                  }}
                />
                {errors.startDate && (
                  <p className="text-destructive text-xs">{errors.startDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={e => {
                    setForm(p => ({ ...p, endDate: e.target.value }));
                    if (errors.endDate) setErrors(p => ({ ...p, endDate: '' }));
                  }}
                />
                {errors.endDate && (
                  <p className="text-destructive text-xs">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this leave plan"
                value={form.description ?? ''}
                onChange={e =>
                  setForm(p => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/admin/leave-plans')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
