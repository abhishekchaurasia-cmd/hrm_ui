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
import { createShift } from '@/services/shifts';

import type { CreateShiftDto } from '@/types/shift';

export function ShiftCreateScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<CreateShiftDto>({
    name: '',
    code: '',
    startTime: '09:00',
    endTime: '18:00',
    breakDurationMinutes: 60,
    workHoursPerDay: 8,
    isFlexible: false,
    graceMinutes: 15,
    isDefault: false,
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name || form.name.length < 2)
      newErrors.name = 'Name must be at least 2 characters';
    if (!form.code || form.code.length < 2)
      newErrors.code = 'Code must be at least 2 characters';
    if (!form.startTime) newErrors.startTime = 'Start time is required';
    if (!form.endTime) newErrors.endTime = 'End time is required';
    if (
      !form.workHoursPerDay ||
      form.workHoursPerDay < 1 ||
      form.workHoursPerDay > 24
    )
      newErrors.workHoursPerDay = 'Work hours must be between 1 and 24';
    if (
      form.breakDurationMinutes !== undefined &&
      (form.breakDurationMinutes < 0 || form.breakDurationMinutes > 480)
    )
      newErrors.breakDurationMinutes = 'Break duration must be 0-480 minutes';
    if (
      form.graceMinutes !== undefined &&
      (form.graceMinutes < 0 || form.graceMinutes > 120)
    )
      newErrors.graceMinutes = 'Grace minutes must be 0-120';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await createShift(form);
      toast.success(res.message);
      router.push('/dashboard/admin/shifts');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setErrors({
          code: err.response.data?.message ?? 'Code already exists',
        });
      } else {
        const message = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? 'Failed to create shift')
          : 'Failed to create shift';
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof CreateShiftDto>(
    key: K,
    value: CreateShiftDto[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/admin/shifts')}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create Shift</h1>
          <p className="text-muted-foreground text-sm">
            Define a new work shift schedule
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shift Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. India Regular"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                />
                {errors.name && (
                  <p className="text-destructive text-xs">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Shift Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. IN-CS"
                  value={form.code}
                  onChange={e => updateField('code', e.target.value)}
                />
                {errors.code && (
                  <p className="text-destructive text-xs">{errors.code}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={e => updateField('startTime', e.target.value)}
                  />
                  {errors.startTime && (
                    <p className="text-destructive text-xs">
                      {errors.startTime}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={e => updateField('endTime', e.target.value)}
                  />
                  {errors.endTime && (
                    <p className="text-destructive text-xs">{errors.endTime}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shift Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workHoursPerDay">Work Hours/Day</Label>
                  <Input
                    id="workHoursPerDay"
                    type="number"
                    step="0.5"
                    min="1"
                    max="24"
                    value={form.workHoursPerDay}
                    onChange={e =>
                      updateField(
                        'workHoursPerDay',
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  {errors.workHoursPerDay && (
                    <p className="text-destructive text-xs">
                      {errors.workHoursPerDay}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakDurationMinutes">Break (minutes)</Label>
                  <Input
                    id="breakDurationMinutes"
                    type="number"
                    min="0"
                    max="480"
                    value={form.breakDurationMinutes ?? 0}
                    onChange={e =>
                      updateField(
                        'breakDurationMinutes',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                  {errors.breakDurationMinutes && (
                    <p className="text-destructive text-xs">
                      {errors.breakDurationMinutes}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="graceMinutes">Grace Period (minutes)</Label>
                <Input
                  id="graceMinutes"
                  type="number"
                  min="0"
                  max="120"
                  value={form.graceMinutes ?? 0}
                  onChange={e =>
                    updateField(
                      'graceMinutes',
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                />
                {errors.graceMinutes && (
                  <p className="text-destructive text-xs">
                    {errors.graceMinutes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isFlexible ?? false}
                    onChange={e => updateField('isFlexible', e.target.checked)}
                    className="border-input size-4 rounded"
                  />
                  Flexible Shift
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isDefault ?? false}
                    onChange={e => updateField('isDefault', e.target.checked)}
                    className="border-input size-4 rounded"
                  />
                  Default Shift
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/admin/shifts')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Shift'}
          </Button>
        </div>
      </form>
    </div>
  );
}
