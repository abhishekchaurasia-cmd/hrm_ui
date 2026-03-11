'use client';

import axios from 'axios';
import { Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

import { EmployeeSelect } from '@/components/employee-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getShiftAssignments,
  assignShift,
  removeShiftAssignment,
} from '@/services/shift-assignments';
import { getShifts } from '@/services/shifts';

import type { Shift, ShiftAssignment } from '@/types/shift';

export function ShiftAssignmentScreen() {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ShiftAssignment | null>(
    null
  );

  const [form, setForm] = useState({
    userId: '',
    shiftId: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [assignRes, shiftRes] = await Promise.all([
        getShiftAssignments(),
        getShifts(),
      ]);
      setAssignments(assignRes.data);
      setShifts(shiftRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleAssign = async () => {
    if (!form.userId || !form.shiftId || !form.effectiveFrom) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await assignShift({
        userId: form.userId,
        shiftId: form.shiftId,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || null,
      });
      toast.success(res.message);
      setShowDialog(false);
      setForm({
        userId: '',
        shiftId: '',
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
      });
      void fetchData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to assign shift')
        : 'Failed to assign shift';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!deleteTarget) return;
    try {
      await removeShiftAssignment(deleteTarget.id);
      toast.success('Assignment removed');
      setDeleteTarget(null);
      void fetchData();
    } catch {
      toast.error('Failed to remove assignment');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shift Assignments</h1>
          <p className="text-muted-foreground text-sm">
            Assign shifts to employees
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="size-4" />
          Assign Shift
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            All Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading assignments...
            </p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No shift assignments yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Effective To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {a.user ? (
                        <div>
                          <p className="font-medium">
                            {a.user.firstName} {a.user.lastName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {a.user.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {a.userId}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {a.shift ? (
                        <div>
                          <p className="font-medium">{a.shift.name}</p>
                          <code className="text-muted-foreground text-xs">
                            {a.shift.code}
                          </code>
                        </div>
                      ) : (
                        a.shiftId
                      )}
                    </TableCell>
                    <TableCell>{a.effectiveFrom}</TableCell>
                    <TableCell>{a.effectiveTo ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={a.isActive ? 'success' : 'secondary'}>
                        {a.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <Trash2 className="text-destructive size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Shift to Employee</DialogTitle>
            <DialogDescription>
              Select an employee and shift, then set the effective dates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <EmployeeSelect
                value={form.userId}
                onValueChange={v => setForm(p => ({ ...p, userId: v }))}
                placeholder="Select employee..."
              />
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <Select
                value={form.shiftId}
                onValueChange={v => setForm(p => ({ ...p, shiftId: v }))}
              >
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective From</Label>
                <Input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={e =>
                    setForm(p => ({ ...p, effectiveFrom: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Effective To (optional)</Label>
                <Input
                  type="date"
                  value={form.effectiveTo}
                  onChange={e =>
                    setForm(p => ({ ...p, effectiveTo: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this shift assignment?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
