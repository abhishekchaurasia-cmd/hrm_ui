'use client';

import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getShiftAssignments } from '@/services/shift-assignments';
import { getShift, updateShift, setWeeklyOffs } from '@/services/shifts';

import type { Shift, ShiftAssignment } from '@/types/shift';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface ShiftDetailScreenProps {
  shiftId: string;
}

export function ShiftDetailScreen({ shiftId }: ShiftDetailScreenProps) {
  const router = useRouter();
  const [shift, setShift] = useState<Shift | null>(null);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOffs, setIsSavingOffs] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '',
    code: '',
    startTime: '',
    endTime: '',
    breakDurationMinutes: 0,
    workHoursPerDay: 0,
    isFlexible: false,
    graceMinutes: 0,
    isDefault: false,
  });

  const [weeklyOffDays, setWeeklyOffDays] = useState<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [shiftRes, assignRes] = await Promise.all([
        getShift(shiftId),
        getShiftAssignments({ shiftId }).catch(() => ({
          data: [] as ShiftAssignment[],
        })),
      ]);
      const s = shiftRes.data;
      setShift(s);
      setForm({
        name: s.name ?? '',
        code: s.code ?? '',
        startTime: s.startTime ? s.startTime.slice(0, 5) : '',
        endTime: s.endTime ? s.endTime.slice(0, 5) : '',
        breakDurationMinutes: s.breakDurationMinutes ?? 0,
        workHoursPerDay: Number(s.workHoursPerDay) || 0,
        isFlexible: s.isFlexible ?? false,
        graceMinutes: s.graceMinutes ?? 0,
        isDefault: s.isDefault ?? false,
      });
      const offs = Array.isArray(s.weeklyOffs) ? s.weeklyOffs : [];
      setWeeklyOffDays(new Set(offs.map(wo => wo.dayOfWeek)));
      const raw = assignRes.data as unknown;
      setAssignments(
        Array.isArray(raw)
          ? raw
          : Array.isArray((raw as Record<string, unknown>)?.items)
            ? ((raw as Record<string, unknown>).items as ShiftAssignment[])
            : []
      );
    } catch {
      toast.error('Failed to load shift details');
    } finally {
      setIsLoading(false);
    }
  }, [shiftId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSaveShift = async () => {
    setIsSaving(true);
    setErrors({});
    try {
      const res = await updateShift(shiftId, form);
      toast.success(res.message);
      setShift(prev => {
        if (!prev) return prev;
        const updated = res.data;
        return {
          ...prev,
          ...updated,
          weeklyOffs: Array.isArray(updated.weeklyOffs)
            ? updated.weeklyOffs
            : prev.weeklyOffs,
        };
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setErrors({ code: err.response.data?.message ?? 'Code conflict' });
      } else {
        toast.error('Failed to update shift');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWeeklyOffs = async () => {
    setIsSavingOffs(true);
    try {
      const res = await setWeeklyOffs(shiftId, {
        weeklyOffs: Array.from(weeklyOffDays).map(day => ({
          dayOfWeek: day,
          isFullDay: true,
        })),
      });
      toast.success(res.message);
    } catch {
      toast.error('Failed to update weekly offs');
    } finally {
      setIsSavingOffs(false);
    }
  };

  const toggleDay = (day: number) => {
    setWeeklyOffDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        Loading shift details...
      </p>
    );
  }

  if (!shift) {
    return (
      <p className="text-destructive py-12 text-center text-sm">
        Shift not found
      </p>
    );
  }

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
          <h1 className="text-2xl font-semibold">{shift.name}</h1>
          <p className="text-muted-foreground text-sm">
            Edit shift details and weekly offs
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shift Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                />
                {errors.code && (
                  <p className="text-destructive text-xs">{errors.code}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={e =>
                    setForm(p => ({ ...p, startTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={e =>
                    setForm(p => ({ ...p, endTime: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Work Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={form.workHoursPerDay}
                  onChange={e =>
                    setForm(p => ({
                      ...p,
                      workHoursPerDay: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Break (min)</Label>
                <Input
                  type="number"
                  value={form.breakDurationMinutes}
                  onChange={e =>
                    setForm(p => ({
                      ...p,
                      breakDurationMinutes: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Grace (min)</Label>
                <Input
                  type="number"
                  value={form.graceMinutes}
                  onChange={e =>
                    setForm(p => ({
                      ...p,
                      graceMinutes: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFlexible}
                  onChange={e =>
                    setForm(p => ({ ...p, isFlexible: e.target.checked }))
                  }
                  className="border-input size-4 rounded"
                />
                Flexible
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={e =>
                    setForm(p => ({ ...p, isDefault: e.target.checked }))
                  }
                  className="border-input size-4 rounded"
                />
                Default
              </label>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveShift} disabled={isSaving}>
                <Save className="size-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Offs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Select days that are weekly offs for this shift.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map(day => (
                <label
                  key={day.value}
                  className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={weeklyOffDays.has(day.value)}
                    onChange={() => toggleDay(day.value)}
                    className="border-input size-4 rounded"
                  />
                  <span className="text-sm font-medium">{day.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveWeeklyOffs} disabled={isSavingOffs}>
                <Save className="size-4" />
                {isSavingOffs ? 'Saving...' : 'Save Weekly Offs'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Employees</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No employees assigned to this shift yet
            </p>
          ) : (
            <>
              <Separator className="mb-4" />
              <div className="space-y-2">
                {assignments.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {a.user
                          ? `${a.user.firstName} ${a.user.lastName}`
                          : a.userId}
                      </p>
                      {a.user && (
                        <p className="text-muted-foreground text-xs">
                          {a.user.email}
                        </p>
                      )}
                    </div>
                    <div className="text-muted-foreground text-right text-xs">
                      <p>From: {a.effectiveFrom}</p>
                      {a.effectiveTo && <p>To: {a.effectiveTo}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
