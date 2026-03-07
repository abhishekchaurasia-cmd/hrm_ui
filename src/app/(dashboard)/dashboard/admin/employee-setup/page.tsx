'use client';

import axios from 'axios';
import { UserCheck, ArrowRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { assignLeavePlan } from '@/services/leave-plan-assignments';
import { getLeavePlans } from '@/services/leave-plans';
import { assignShift } from '@/services/shift-assignments';
import { getShifts } from '@/services/shifts';

import type { LeavePlan } from '@/types/leave';
import type { Shift } from '@/types/shift';

export default function EmployeeSetupPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [plans, setPlans] = useState<LeavePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userId, setUserId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [leavePlanId, setLeavePlanId] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [shiftRes, planRes] = await Promise.all([
        getShifts(),
        getLeavePlans(),
      ]);
      setShifts(shiftRes.data);
      setPlans(planRes.data);
    } catch {
      toast.error('Failed to load options');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOptions();
  }, [fetchOptions]);

  const handleAssignShift = async () => {
    if (!userId || !shiftId) {
      toast.error('Employee ID and shift are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await assignShift({
        userId,
        shiftId,
        effectiveFrom,
      });
      toast.success('Shift assigned successfully');
      setStep(1);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to assign shift')
        : 'Failed to assign shift';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignLeavePlan = async () => {
    if (!userId || !leavePlanId) {
      toast.error('Leave plan is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await assignLeavePlan({
        userId,
        leavePlanId,
        effectiveFrom,
      });
      toast.success('Leave plan assigned successfully');
      setStep(2);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to assign leave plan')
        : 'Failed to assign leave plan';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUserId('');
    setShiftId('');
    setLeavePlanId('');
    setStep(0);
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        Loading...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold">Employee Onboarding Setup</h1>
        <p className="text-muted-foreground text-sm">
          Assign a shift and leave plan to onboard a new employee
        </p>
      </div>

      <div className="flex gap-3">
        <Badge variant={step >= 0 ? 'default' : 'secondary'}>
          1. Employee & Shift
        </Badge>
        <ArrowRight className="text-muted-foreground size-4 self-center" />
        <Badge variant={step >= 1 ? 'default' : 'secondary'}>
          2. Leave Plan
        </Badge>
        <ArrowRight className="text-muted-foreground size-4 self-center" />
        <Badge variant={step >= 2 ? 'default' : 'secondary'}>3. Complete</Badge>
      </div>

      {step === 0 && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="size-5" />
              Step 1: Assign Shift
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input
                placeholder="Enter employee UUID"
                value={userId}
                onChange={e => setUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={shiftId} onValueChange={setShiftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Effective From</Label>
              <Input
                type="date"
                value={effectiveFrom}
                onChange={e => setEffectiveFrom(e.target.value)}
              />
            </div>
            <Separator />
            <Button onClick={handleAssignShift} disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Shift & Continue'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="size-5" />
              Step 2: Assign Leave Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Leave Plan</Label>
              <Select value={leavePlanId} onValueChange={setLeavePlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a leave plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <Button onClick={handleAssignLeavePlan} disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Plan & Complete'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Setup Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              The employee has been assigned a shift and leave plan. You can now
              initialize their leave balances from the leave plan page.
            </p>
            <Button variant="outline" onClick={handleReset}>
              Set Up Another Employee
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
