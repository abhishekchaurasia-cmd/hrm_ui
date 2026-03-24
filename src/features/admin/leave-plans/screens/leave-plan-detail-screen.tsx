'use client';

import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Save, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

import { EmployeeMultiSelect } from '@/components/employee-multi-select';
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
import { Pagination, type PaginatedResponse } from '@/components/ui/pagination';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { initializeBalances } from '@/services/leave-balances';
import {
  getLeavePlanAssignments,
  assignLeavePlan,
  removeLeavePlanAssignment,
} from '@/services/leave-plan-assignments';
import {
  getLeavePlan,
  updateLeavePlan,
  addLeaveType,
  removeLeaveType,
  yearEndProcessing,
} from '@/services/leave-plans';

import type {
  LeavePlan,
  LeaveTypeConfig,
  CreateLeaveTypeConfigDto,
  LeavePlanAssignment,
  YearEndAction,
} from '@/types/leave';

const YEAR_END_LABELS: Record<YearEndAction, string> = {
  reset_to_zero: 'Reset to Zero',
  carry_forward_all: 'Carry Forward All',
  carry_forward_limited: 'Carry Forward (Limited)',
  none: 'None',
};

interface LeavePlanDetailScreenProps {
  planId: string;
}

export function LeavePlanDetailScreen({ planId }: LeavePlanDetailScreenProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<LeavePlan | null>(null);
  const [assignments, setAssignments] = useState<LeavePlanAssignment[]>([]);
  const [assignPage, setAssignPage] = useState(1);
  const [assignLimit, setAssignLimit] = useState(20);
  const [assignTotal, setAssignTotal] = useState(0);
  const [assignTotalPages, setAssignTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showAddType, setShowAddType] = useState(false);
  const [isAddingType, setIsAddingType] = useState(false);
  const [typeForm, setTypeForm] = useState<CreateLeaveTypeConfigDto>({
    name: '',
    code: '',
    quota: 0,
    isUnlimited: false,
    isPaid: true,
    yearEndAction: 'reset_to_zero',
    maxCarryForward: null,
    carryForwardExpiryDays: null,
    isEncashable: false,
  });

  const [showAssignEmployee, setShowAssignEmployee] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userIds: [] as string[],
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
  });

  const [showYearEnd, setShowYearEnd] = useState(false);
  const [yearEndForm, setYearEndForm] = useState({
    processingYear: new Date().getFullYear(),
    newYear: new Date().getFullYear() + 1,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [planRes, assignRes] = await Promise.all([
        getLeavePlan(planId),
        getLeavePlanAssignments({
          planId,
          page: assignPage,
          limit: assignLimit,
        }).catch(() => ({
          data: {
            items: [] as LeavePlanAssignment[],
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 1,
          },
        })),
      ]);
      setPlan(planRes.data);
      setEditForm({
        name: planRes.data.name,
        description: planRes.data.description ?? '',
      });
      const paginated =
        assignRes.data as unknown as PaginatedResponse<LeavePlanAssignment>;
      setAssignments(paginated.items);
      setAssignTotal(paginated.total);
      setAssignTotalPages(paginated.totalPages);
    } catch {
      toast.error('Failed to load leave plan');
    } finally {
      setIsLoading(false);
    }
  }, [planId, assignPage, assignLimit]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const res = await updateLeavePlan(planId, {
        name: editForm.name,
        description: editForm.description || undefined,
      });
      toast.success(res.message);
      setPlan(prev => (prev ? { ...prev, ...res.data } : prev));
    } catch {
      toast.error('Failed to update plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLeaveType = async () => {
    if (!typeForm.name || !typeForm.code) {
      toast.error('Name and code are required');
      return;
    }
    setIsAddingType(true);
    try {
      const res = await addLeaveType(planId, typeForm);
      toast.success(res.message);
      setShowAddType(false);
      setTypeForm({
        name: '',
        code: '',
        quota: 0,
        isUnlimited: false,
        isPaid: true,
        yearEndAction: 'reset_to_zero',
        maxCarryForward: null,
        carryForwardExpiryDays: null,
        isEncashable: false,
      });
      void fetchData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to add leave type')
        : 'Failed to add leave type';
      toast.error(message);
    } finally {
      setIsAddingType(false);
    }
  };

  const handleRemoveLeaveType = async (typeId: string) => {
    try {
      await removeLeaveType(planId, typeId);
      toast.success('Leave type removed');
      void fetchData();
    } catch {
      toast.error('Failed to remove leave type');
    }
  };

  const handleAssignEmployee = async () => {
    if (assignForm.userIds.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    setIsAssigning(true);
    try {
      const results = await Promise.allSettled(
        assignForm.userIds.map(userId =>
          assignLeavePlan({
            userId,
            leavePlanId: planId,
            effectiveFrom: assignForm.effectiveFrom,
            effectiveTo: assignForm.effectiveTo || null,
          })
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (failed === 0) {
        toast.success(`Plan assigned to ${succeeded} employee(s)`);
      } else if (succeeded === 0) {
        const firstErr = results.find(
          r => r.status === 'rejected'
        ) as PromiseRejectedResult;
        const message = axios.isAxiosError(firstErr.reason)
          ? (firstErr.reason.response?.data?.message ?? 'Failed to assign plan')
          : 'Failed to assign plan';
        toast.error(message);
      } else {
        toast.warning(
          `Assigned to ${succeeded} employee(s), failed for ${failed}`
        );
      }

      setShowAssignEmployee(false);
      setAssignForm({
        userIds: [],
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
      });
      void fetchData();
    } catch {
      toast.error('Failed to assign plan');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAssignment = async (id: string) => {
    try {
      await removeLeavePlanAssignment(id);
      toast.success('Assignment removed');
      void fetchData();
    } catch {
      toast.error('Failed to remove assignment');
    }
  };

  const handleYearEnd = async () => {
    setIsProcessing(true);
    try {
      const res = await yearEndProcessing(planId, yearEndForm);
      toast.success(res.message);
      setShowYearEnd(false);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Year-end processing failed')
        : 'Year-end processing failed';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitializeBalances = async () => {
    setIsInitializing(true);
    try {
      const res = await initializeBalances(planId);
      toast.success(res.message);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to initialize balances')
        : 'Failed to initialize balances';
      toast.error(message);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        Loading leave plan...
      </p>
    );
  }

  if (!plan) {
    return (
      <p className="text-destructive py-12 text-center text-sm">
        Leave plan not found
      </p>
    );
  }

  const leaveTypes: LeaveTypeConfig[] = plan.leaveTypeConfigs ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/admin/leave-plans')}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{plan.name}</h1>
            <p className="text-muted-foreground text-sm">
              {plan.startDate} — {plan.endDate}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleInitializeBalances}
          disabled={isInitializing}
        >
          {isInitializing ? 'Initializing...' : 'Initialize Balances'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input
                value={editForm.name}
                onChange={e =>
                  setEditForm(p => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editForm.description}
                onChange={e =>
                  setEditForm(p => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSavePlan} disabled={isSaving} size="sm">
              <Save className="size-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="leave-types">
        <TabsList>
          <TabsTrigger value="leave-types">
            Leave Types ({leaveTypes.length})
          </TabsTrigger>
          <TabsTrigger value="employees">
            Assigned Employees ({assignTotal})
          </TabsTrigger>
          <TabsTrigger value="year-end">Year-End Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="leave-types">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Leave Types</CardTitle>
              <Button size="sm" onClick={() => setShowAddType(true)}>
                <Plus className="size-4" />
                Add Type
              </Button>
            </CardHeader>
            <CardContent>
              {leaveTypes.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No leave types configured. Add leave types to this plan.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Quota</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Year-End</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveTypes.map(lt => (
                      <TableRow key={lt.id}>
                        <TableCell className="font-medium">{lt.name}</TableCell>
                        <TableCell>
                          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                            {lt.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          {lt.isUnlimited ? (
                            <Badge variant="warning">Unlimited</Badge>
                          ) : (
                            Number(lt.quota)
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={lt.isPaid ? 'success' : 'secondary'}>
                            {lt.isPaid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {YEAR_END_LABELS[lt.yearEndAction]}
                          {lt.yearEndAction === 'carry_forward_limited' &&
                            lt.maxCarryForward !== null &&
                            ` (max ${lt.maxCarryForward})`}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleRemoveLeaveType(lt.id)}
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
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Assigned Employees</CardTitle>
              <Button size="sm" onClick={() => setShowAssignEmployee(true)}>
                <Plus className="size-4" />
                Assign Employee
              </Button>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No employees assigned to this plan yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
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
                            <span className="text-xs">{a.userId}</span>
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
                            onClick={() => handleRemoveAssignment(a.id)}
                          >
                            <Trash2 className="text-destructive size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {assignTotal > 0 && (
                <Pagination
                  page={assignPage}
                  totalPages={assignTotalPages}
                  total={assignTotal}
                  limit={assignLimit}
                  onPageChange={setAssignPage}
                  onLimitChange={setAssignLimit}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="year-end">
          <Card>
            <CardHeader>
              <CardTitle>Year-End Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Process carry-forward and resets for all assigned employees
                based on each leave type&apos;s year-end action, and create new
                year balances.
              </p>
              <div className="grid max-w-md grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Processing Year</Label>
                  <Input
                    type="number"
                    value={yearEndForm.processingYear}
                    onChange={e =>
                      setYearEndForm(p => ({
                        ...p,
                        processingYear: parseInt(e.target.value, 10),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Year</Label>
                  <Input
                    type="number"
                    value={yearEndForm.newYear}
                    onChange={e =>
                      setYearEndForm(p => ({
                        ...p,
                        newYear: parseInt(e.target.value, 10),
                      }))
                    }
                  />
                </div>
              </div>
              <Button onClick={() => setShowYearEnd(true)}>
                <Play className="size-4" />
                Run Year-End Processing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Leave Type Dialog */}
      <Dialog open={showAddType} onOpenChange={setShowAddType}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Leave Type</DialogTitle>
            <DialogDescription>
              Configure a new leave type for this plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. Sick Leave"
                  value={typeForm.name}
                  onChange={e =>
                    setTypeForm(p => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  placeholder="e.g. SL"
                  value={typeForm.code}
                  onChange={e =>
                    setTypeForm(p => ({ ...p, code: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quota (days)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="365"
                  value={typeForm.quota}
                  disabled={typeForm.isUnlimited}
                  onChange={e =>
                    setTypeForm(p => ({
                      ...p,
                      quota: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Year-End Action</Label>
                <Select
                  value={typeForm.yearEndAction}
                  onValueChange={v =>
                    setTypeForm(p => ({
                      ...p,
                      yearEndAction: v as YearEndAction,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reset_to_zero">Reset to Zero</SelectItem>
                    <SelectItem value="carry_forward_all">
                      Carry Forward All
                    </SelectItem>
                    <SelectItem value="carry_forward_limited">
                      Carry Forward (Limited)
                    </SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {typeForm.yearEndAction === 'carry_forward_limited' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Carry Forward</Label>
                  <Input
                    type="number"
                    min="0"
                    value={typeForm.maxCarryForward ?? ''}
                    onChange={e =>
                      setTypeForm(p => ({
                        ...p,
                        maxCarryForward: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carry Forward Expiry (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={typeForm.carryForwardExpiryDays ?? ''}
                    onChange={e =>
                      setTypeForm(p => ({
                        ...p,
                        carryForwardExpiryDays: e.target.value
                          ? parseInt(e.target.value, 10)
                          : null,
                      }))
                    }
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={typeForm.isUnlimited}
                  onChange={e =>
                    setTypeForm(p => ({ ...p, isUnlimited: e.target.checked }))
                  }
                  className="border-input size-4 rounded"
                />
                Unlimited
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={typeForm.isPaid}
                  onChange={e =>
                    setTypeForm(p => ({ ...p, isPaid: e.target.checked }))
                  }
                  className="border-input size-4 rounded"
                />
                Paid
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={typeForm.isEncashable}
                  onChange={e =>
                    setTypeForm(p => ({
                      ...p,
                      isEncashable: e.target.checked,
                    }))
                  }
                  className="border-input size-4 rounded"
                />
                Encashable
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddType(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLeaveType} disabled={isAddingType}>
              {isAddingType ? 'Adding...' : 'Add Leave Type'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Employee Dialog */}
      <Dialog open={showAssignEmployee} onOpenChange={setShowAssignEmployee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Employees to Plan</DialogTitle>
            <DialogDescription>
              Select employees and set the effective dates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employees</Label>
              <EmployeeMultiSelect
                value={assignForm.userIds}
                onValueChange={v => setAssignForm(p => ({ ...p, userIds: v }))}
                placeholder="Select employees..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective From</Label>
                <Input
                  type="date"
                  value={assignForm.effectiveFrom}
                  onChange={e =>
                    setAssignForm(p => ({
                      ...p,
                      effectiveFrom: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Effective To (optional)</Label>
                <Input
                  type="date"
                  value={assignForm.effectiveTo}
                  onChange={e =>
                    setAssignForm(p => ({
                      ...p,
                      effectiveTo: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignEmployee(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignEmployee} disabled={isAssigning}>
              {isAssigning ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Year-End Confirmation Dialog */}
      <Dialog open={showYearEnd} onOpenChange={setShowYearEnd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Year-End Processing</DialogTitle>
            <DialogDescription>
              This will process carry-forward/resets for all employees assigned
              to this plan for year {yearEndForm.processingYear} and create new
              balances for {yearEndForm.newYear}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowYearEnd(false)}>
              Cancel
            </Button>
            <Button onClick={handleYearEnd} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm & Process'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
