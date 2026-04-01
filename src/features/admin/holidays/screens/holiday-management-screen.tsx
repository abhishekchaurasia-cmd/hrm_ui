'use client';

import axios from 'axios';
import {
  Globe,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserMinus,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  addHoliday,
  assignEmployees,
  createHolidayPlan,
  deleteHolidayPlan,
  getAssignedEmployees,
  getAvailableCountries,
  getHolidayPlanDetail,
  getHolidayPlans,
  getPublicHolidays,
  getUnassignedEmployees,
  importHolidays,
  removeHoliday,
  unassignEmployees,
  updateHoliday,
  updateHolidayPlan,
} from '@/services/holidays';

import type {
  AddHolidayPayload,
  AssignedEmployee,
  Holiday,
  HolidayPlan,
  HolidayPlanDetail,
  PublicHoliday,
  PublicHolidayCountry,
} from '@/types/holiday';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_TABS = [
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 1,
  CURRENT_YEAR,
  CURRENT_YEAR + 1,
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function errMsg(err: unknown): string {
  if (axios.isAxiosError(err))
    return err.response?.data?.message ?? err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

export function HolidayManagementScreen() {
  const [plans, setPlans] = useState<HolidayPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planDetail, setPlanDetail] = useState<HolidayPlanDetail | null>(null);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'holidays' | 'employees'>(
    'holidays'
  );

  // Employee assignment state
  const [assignedEmployees, setAssignedEmployees] = useState<
    AssignedEmployee[]
  >([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [unassigningEmployee, setUnassigningEmployee] =
    useState<AssignedEmployee | null>(null);

  // Modal states
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<HolidayPlan | null>(null);
  const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);
  const [showEditPlan, setShowEditPlan] = useState(false);

  // ── Fetch plans ──
  const fetchPlans = useCallback(async (year: number) => {
    setIsLoadingPlans(true);
    try {
      const res = await getHolidayPlans(year);
      setPlans(res.data);
    } catch {
      toast.error('Failed to load holiday plans');
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  const fetchDetail = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await getHolidayPlanDetail(id);
      setPlanDetail(res.data);
    } catch {
      toast.error('Failed to load plan detail');
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlans(selectedYear);
  }, [selectedYear, fetchPlans]);

  const fetchEmployees = useCallback(async (id: string) => {
    setIsLoadingEmployees(true);
    try {
      const res = await getAssignedEmployees(id);
      setAssignedEmployees(res.data?.items ?? []);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setIsLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      void fetchDetail(selectedPlanId);
      void fetchEmployees(selectedPlanId);
    } else {
      setPlanDetail(null);
      setAssignedEmployees([]);
    }
  }, [selectedPlanId, fetchDetail, fetchEmployees]);

  // Auto-select first plan when plans change
  useEffect(() => {
    if (plans.length > 0 && !plans.find(p => p.id === selectedPlanId)) {
      setSelectedPlanId(plans[0].id);
      setActiveTab('holidays');
    } else if (plans.length === 0) {
      setSelectedPlanId(null);
      setActiveTab('holidays');
    }
  }, [plans, selectedPlanId]);

  const refreshAll = useCallback(async () => {
    await fetchPlans(selectedYear);
    if (selectedPlanId) {
      await fetchDetail(selectedPlanId);
      await fetchEmployees(selectedPlanId);
    }
  }, [fetchPlans, fetchDetail, fetchEmployees, selectedYear, selectedPlanId]);

  const filteredPlans = plans.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPlan = plans.find(p => p.id === selectedPlanId) ?? null;

  // ── Render ──
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Holiday Management
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage holiday plans and assign them to employees
        </p>
      </div>

      <div className="flex gap-5" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* ── Left Sidebar ── */}
        <div className="flex w-72 shrink-0 flex-col gap-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {isLoadingPlans ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Loading plans...
              </p>
            ) : filteredPlans.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No plans found
              </p>
            ) : (
              filteredPlans.map(plan => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selectedPlanId === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{plan.name}</span>
                    {plan.isDefault && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px]"
                      >
                        DEFAULT
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {plan.employeeCount} employee
                    {plan.employeeCount !== 1 ? 's' : ''}
                  </span>
                </button>
              ))
            )}
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setShowCreatePlan(true)}
          >
            <Plus className="size-4" />
            New holiday plan
          </Button>
        </div>

        {/* ── Right Content ── */}
        <div className="flex-1">
          {!selectedPlan ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <Globe className="text-muted-foreground mb-4 size-12" />
                <p className="text-muted-foreground text-sm">
                  {plans.length === 0
                    ? 'Create your first holiday plan to get started'
                    : 'Select a plan from the sidebar'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Plan Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedPlan.name}</h2>
                  <p className="text-muted-foreground text-sm">
                    {selectedPlan.employeeCount} Employee
                    {selectedPlan.employeeCount !== 1 ? 's' : ''}
                    {selectedPlan.description
                      ? ` · ${selectedPlan.description}`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setShowEditPlan(true)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 gap-1.5"
                    onClick={() => setDeletingPlan(selectedPlan)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Holidays / Employees Tab Switcher */}
              <div className="bg-muted inline-flex gap-1 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('holidays')}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'holidays'
                      ? 'bg-background text-foreground shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Holidays
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('employees')}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'employees'
                      ? 'bg-background text-foreground shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Employees
                </button>
              </div>

              {activeTab === 'holidays' ? (
                <>
                  {/* Year Tabs */}
                  <div className="bg-muted inline-flex gap-1 rounded-lg p-1">
                    {YEAR_TABS.map(year => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setSelectedYear(year)}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                          selectedYear === year
                            ? 'bg-background text-foreground shadow'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setShowAddHoliday(true)}
                    >
                      <Plus className="size-3.5" />
                      Add Holiday
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setShowImport(true)}
                    >
                      <Globe className="size-3.5" />
                      Import from Country
                    </Button>
                  </div>

                  {/* Holidays Table */}
                  <Card>
                    <CardContent className="p-0">
                      {isLoadingDetail ? (
                        <p className="text-muted-foreground py-12 text-center text-sm">
                          Loading holidays...
                        </p>
                      ) : !planDetail || planDetail.holidays.length === 0 ? (
                        <p className="text-muted-foreground py-12 text-center text-sm">
                          No holidays in this plan. Add one or import from a
                          country.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Holiday Name</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Optional</TableHead>
                              <TableHead>Special</TableHead>
                              <TableHead className="w-20" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {planDetail.holidays
                              .slice()
                              .sort((a, b) => a.date.localeCompare(b.date))
                              .map(holiday => (
                                <TableRow key={holiday.id} className="group">
                                  <TableCell className="font-medium">
                                    {holiday.name}
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(holiday.date)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        holiday.isOptional
                                          ? 'warning'
                                          : 'secondary'
                                      }
                                    >
                                      {holiday.isOptional ? 'Yes' : 'No'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        holiday.isSpecial
                                          ? 'warning'
                                          : 'secondary'
                                      }
                                    >
                                      {holiday.isSpecial ? 'Yes' : 'No'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        onClick={() =>
                                          setEditingHoliday(holiday)
                                        }
                                      >
                                        <Pencil className="size-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive size-7"
                                        onClick={() =>
                                          setDeletingHoliday(holiday)
                                        }
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Employees Action Bar */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setShowAssignModal(true)}
                    >
                      <Plus className="size-3.5" />
                      Assign Employees
                    </Button>
                  </div>

                  {/* Assigned Employees Table */}
                  <Card>
                    <CardContent className="p-0">
                      {isLoadingEmployees ? (
                        <p className="text-muted-foreground py-12 text-center text-sm">
                          Loading employees...
                        </p>
                      ) : assignedEmployees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Users className="text-muted-foreground mb-3 size-10" />
                          <p className="text-muted-foreground text-sm">
                            No employees assigned to this plan yet.
                          </p>
                        </div>
                      ) : (
                        <>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Emp. Number</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="w-24">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {assignedEmployees.map(emp => (
                                <TableRow key={emp.userId}>
                                  <TableCell className="font-medium">
                                    {emp.employeeNumber || '—'}
                                  </TableCell>
                                  <TableCell>
                                    {emp.displayName ||
                                      `${emp.user.firstName} ${emp.user.lastName}`}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {emp.user.email}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive gap-1.5"
                                      onClick={() =>
                                        setUnassigningEmployee(emp)
                                      }
                                    >
                                      <UserMinus className="size-3.5" />
                                      Remove
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <p className="text-muted-foreground border-t px-4 py-3 text-sm">
                            Showing {assignedEmployees.length} employee
                            {assignedEmployees.length !== 1 ? 's' : ''}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Dialogs ═══ */}

      <CreatePlanDialog
        open={showCreatePlan}
        onOpenChange={setShowCreatePlan}
        year={selectedYear}
        onCreated={async id => {
          await fetchPlans(selectedYear);
          setSelectedPlanId(id);
        }}
      />

      <EditPlanDialog
        open={showEditPlan}
        onOpenChange={setShowEditPlan}
        plan={selectedPlan}
        onUpdated={refreshAll}
      />

      <AddHolidayDialog
        open={showAddHoliday}
        onOpenChange={setShowAddHoliday}
        listId={selectedPlanId}
        onAdded={refreshAll}
      />

      <EditHolidayDialog
        open={!!editingHoliday}
        onOpenChange={open => {
          if (!open) setEditingHoliday(null);
        }}
        listId={selectedPlanId}
        holiday={editingHoliday}
        onUpdated={refreshAll}
      />

      <ImportHolidaysDialog
        open={showImport}
        onOpenChange={setShowImport}
        listId={selectedPlanId}
        year={selectedYear}
        onImported={refreshAll}
      />

      <DeletePlanDialog
        plan={deletingPlan}
        onOpenChange={open => {
          if (!open) setDeletingPlan(null);
        }}
        onDeleted={async () => {
          setSelectedPlanId(null);
          await fetchPlans(selectedYear);
        }}
      />

      <DeleteHolidayDialog
        listId={selectedPlanId}
        holiday={deletingHoliday}
        onOpenChange={open => {
          if (!open) setDeletingHoliday(null);
        }}
        onDeleted={refreshAll}
      />

      <AssignEmployeesDialog
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        listId={selectedPlanId}
        planName={selectedPlan?.name ?? ''}
        onAssigned={refreshAll}
      />

      <UnassignEmployeeDialog
        employee={unassigningEmployee}
        onOpenChange={open => {
          if (!open) setUnassigningEmployee(null);
        }}
        listId={selectedPlanId}
        planName={selectedPlan?.name ?? ''}
        onUnassigned={refreshAll}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Create Plan Dialog
   ═══════════════════════════════════════════════ */

function CreatePlanDialog({
  open,
  onOpenChange,
  year,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  year: number;
  onCreated: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: '',
    year: year,
    description: '',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ name: '', year, description: '', isDefault: false });
  }, [open, year]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await createHolidayPlan({
        name: form.name.trim(),
        year: form.year,
        description: form.description.trim() || undefined,
        isDefault: form.isDefault || undefined,
      });
      toast.success('Holiday plan created');
      onOpenChange(false);
      await onCreated(res.data.id);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Holiday Plan</DialogTitle>
          <DialogDescription>
            Create a new holiday plan for a specific year.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Plan Name *</Label>
            <Input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. PB-IN"
            />
          </div>
          <div className="space-y-2">
            <Label>Year *</Label>
            <Input
              type="number"
              value={form.year}
              onChange={e =>
                setForm(p => ({
                  ...p,
                  year: parseInt(e.target.value) || CURRENT_YEAR,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={e =>
                setForm(p => ({ ...p, description: e.target.value }))
              }
              placeholder="Optional description"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isDefault}
              onCheckedChange={v =>
                setForm(p => ({ ...p, isDefault: v as boolean }))
              }
            />
            Set as default plan for this year
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : 'Create Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   Edit Plan Dialog
   ═══════════════════════════════════════════════ */

function EditPlanDialog({
  open,
  onOpenChange,
  plan,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: HolidayPlan | null;
  onUpdated: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && plan) {
      setForm({
        name: plan.name,
        description: plan.description ?? '',
        isDefault: plan.isDefault,
      });
    }
  }, [open, plan]);

  const handleSubmit = async () => {
    if (!plan) return;
    if (!form.name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    setSaving(true);
    try {
      await updateHolidayPlan(plan.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        isDefault: form.isDefault,
      });
      toast.success('Plan updated');
      onOpenChange(false);
      await onUpdated();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Holiday Plan</DialogTitle>
          <DialogDescription>Update plan details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Plan Name *</Label>
            <Input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={e =>
                setForm(p => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isDefault}
              onCheckedChange={v =>
                setForm(p => ({ ...p, isDefault: v as boolean }))
              }
            />
            Set as default plan
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   Add Holiday Dialog
   ═══════════════════════════════════════════════ */

function AddHolidayDialog({
  open,
  onOpenChange,
  listId,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string | null;
  onAdded: () => Promise<void>;
}) {
  const [form, setForm] = useState<AddHolidayPayload>({
    name: '',
    date: '',
    isOptional: false,
    isSpecial: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open)
      setForm({ name: '', date: '', isOptional: false, isSpecial: false });
  }, [open]);

  const handleSubmit = async () => {
    if (!listId) return;
    if (!form.name.trim()) {
      toast.error('Holiday name is required');
      return;
    }
    if (!form.date) {
      toast.error('Please select a date');
      return;
    }
    setSaving(true);
    try {
      await addHoliday(listId, { ...form, name: form.name.trim() });
      toast.success('Holiday added');
      onOpenChange(false);
      await onAdded();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Holiday</DialogTitle>
          <DialogDescription>Add a new holiday to this plan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Holiday Name *</Label>
            <Input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Republic Day"
            />
          </div>
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input
              type="date"
              value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isOptional}
              onCheckedChange={v =>
                setForm(p => ({ ...p, isOptional: v as boolean }))
              }
            />
            Optional Holiday
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isSpecial}
              onCheckedChange={v =>
                setForm(p => ({ ...p, isSpecial: v as boolean }))
              }
            />
            Special Holiday
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Adding...' : 'Add Holiday'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   Edit Holiday Dialog
   ═══════════════════════════════════════════════ */

function EditHolidayDialog({
  open,
  onOpenChange,
  listId,
  holiday,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string | null;
  holiday: Holiday | null;
  onUpdated: () => Promise<void>;
}) {
  const [form, setForm] = useState<AddHolidayPayload>({
    name: '',
    date: '',
    isOptional: false,
    isSpecial: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && holiday) {
      setForm({
        name: holiday.name,
        date: holiday.date,
        isOptional: holiday.isOptional,
        isSpecial: holiday.isSpecial,
      });
    }
  }, [open, holiday]);

  const handleSubmit = async () => {
    if (!listId || !holiday) return;
    if (!form.name.trim()) {
      toast.error('Holiday name is required');
      return;
    }
    if (!form.date) {
      toast.error('Please select a date');
      return;
    }
    setSaving(true);
    try {
      await updateHoliday(listId, holiday.id, {
        name: form.name.trim(),
        date: form.date,
        isOptional: form.isOptional,
        isSpecial: form.isSpecial,
      });
      toast.success('Holiday updated');
      onOpenChange(false);
      await onUpdated();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Holiday</DialogTitle>
          <DialogDescription>Update holiday details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Holiday Name *</Label>
            <Input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input
              type="date"
              value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isOptional}
              onCheckedChange={v =>
                setForm(p => ({ ...p, isOptional: v as boolean }))
              }
            />
            Optional Holiday
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isSpecial}
              onCheckedChange={v =>
                setForm(p => ({ ...p, isSpecial: v as boolean }))
              }
            />
            Special Holiday
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   Import Holidays Dialog
   ═══════════════════════════════════════════════ */

function ImportHolidaysDialog({
  open,
  onOpenChange,
  listId,
  year,
  onImported,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string | null;
  year: number;
  onImported: () => Promise<void>;
}) {
  const [countries, setCountries] = useState<PublicHolidayCountry[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [importYear, setImportYear] = useState(year);

  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedCountry('');
    setImportYear(year);
    setHolidays([]);
    setSelectedKeys(new Set());

    setIsLoadingCountries(true);
    getAvailableCountries()
      .then(res => setCountries(res.data))
      .catch(() => toast.error('Failed to load countries'))
      .finally(() => setIsLoadingCountries(false));
  }, [open, year]);

  const handleLoad = async () => {
    if (!selectedCountry) {
      toast.error('Please select a country');
      return;
    }
    setIsLoadingHolidays(true);
    try {
      const res = await getPublicHolidays(selectedCountry, importYear);
      setHolidays(res.data);
      setSelectedKeys(
        new Set(res.data.map((_, i) => `${res.data[i].date}-${i}`))
      );
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setIsLoadingHolidays(false);
    }
  };

  const toggleDate = (uid: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedKeys.size === holidays.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(holidays.map((h, i) => `${h.date}-${i}`)));
    }
  };

  const handleImport = async () => {
    if (!listId) return;
    if (selectedKeys.size === 0) {
      toast.error('Select at least one holiday');
      return;
    }
    setIsImporting(true);
    try {
      const selected = holidays
        .filter((_, i) => selectedKeys.has(`${holidays[i].date}-${i}`))
        .map(h => ({ name: h.name, date: h.date }));
      const res = await importHolidays(listId, {
        countryCode: selectedCountry,
        year: importYear,
        selectedHolidays: selected,
      });
      const { added, skipped } = res.data;
      if (skipped > 0)
        toast.info(`${added} imported, ${skipped} skipped (already exist)`);
      else toast.success(`${added} holidays imported`);
      onOpenChange(false);
      await onImported();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Public Holidays</DialogTitle>
          <DialogDescription>
            Select a country and year to browse public holidays, then pick which
            ones to import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_120px_auto] gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Country</Label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
                disabled={isLoadingCountries}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingCountries ? 'Loading...' : 'Select country'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.countryCode} value={c.countryCode}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Year</Label>
              <Input
                type="number"
                value={importYear}
                onChange={e =>
                  setImportYear(parseInt(e.target.value) || CURRENT_YEAR)
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                size="sm"
                onClick={handleLoad}
                disabled={isLoadingHolidays || !selectedCountry}
              >
                {isLoadingHolidays ? 'Loading...' : 'Load'}
              </Button>
            </div>
          </div>

          {holidays.length > 0 && (
            <>
              <div className="max-h-72 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            selectedKeys.size === holidays.length &&
                            holidays.length > 0
                          }
                          onCheckedChange={() => toggleAll()}
                        />
                      </TableHead>
                      <TableHead>Holiday Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holidays.map((h, idx) => {
                      const uid = `${h.date}-${idx}`;
                      return (
                        <TableRow key={uid}>
                          <TableCell>
                            <Checkbox
                              checked={selectedKeys.has(uid)}
                              onCheckedChange={() => toggleDate(uid)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {h.name}
                          </TableCell>
                          <TableCell>{formatDate(h.date)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {h.types?.[0] ?? 'Public'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <p className="text-muted-foreground text-sm">
                {selectedKeys.size} of {holidays.length} holiday
                {holidays.length !== 1 ? 's' : ''} selected
              </p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {holidays.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={isImporting || selectedKeys.size === 0}
            >
              {isImporting
                ? 'Importing...'
                : `Import Selected (${selectedKeys.size})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   Delete Plan Dialog
   ═══════════════════════════════════════════════ */

function DeletePlanDialog({
  plan,
  onOpenChange,
  onDeleted,
}: {
  plan: HolidayPlan | null;
  onOpenChange: (v: boolean) => void;
  onDeleted: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!plan) return;
    setDeleting(true);
    try {
      await deleteHolidayPlan(plan.id);
      toast.success('Holiday plan deleted');
      onOpenChange(false);
      await onDeleted();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!plan} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Holiday Plan</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{plan?.name}&quot;?
            {plan && plan.employeeCount > 0 && (
              <>
                {' '}
                This plan has {plan.employeeCount} employee
                {plan.employeeCount !== 1 ? 's' : ''} assigned. They will fall
                back to the default plan.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   Delete Holiday Dialog
   ═══════════════════════════════════════════════ */

function DeleteHolidayDialog({
  listId,
  holiday,
  onOpenChange,
  onDeleted,
}: {
  listId: string | null;
  holiday: Holiday | null;
  onOpenChange: (v: boolean) => void;
  onDeleted: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!listId || !holiday) return;
    setDeleting(true);
    try {
      await removeHoliday(listId, holiday.id);
      toast.success('Holiday removed');
      onOpenChange(false);
      await onDeleted();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!holiday} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Holiday</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove &quot;{holiday?.name}&quot; (
            {holiday ? formatDate(holiday.date) : ''})?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Removing...' : 'Remove'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   Assign Employees Dialog
   ═══════════════════════════════════════════════ */

function AssignEmployeesDialog({
  open,
  onOpenChange,
  listId,
  planName,
  onAssigned,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string | null;
  planName: string;
  onAssigned: () => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState<AssignedEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const loadEmployees = useCallback(
    async (listIdVal: string, query: string) => {
      setIsLoading(true);
      try {
        const res = await getUnassignedEmployees(listIdVal, query || undefined);
        const data = res.data;
        setEmployees(Array.isArray(data) ? data : (data.items ?? []));
      } catch {
        toast.error('Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!open || !listId) return;
    setSearch('');
    setSelectedIds(new Set());
    setEmployees([]);
    void loadEmployees(listId, '');
  }, [open, listId, loadEmployees]);

  useEffect(() => {
    if (!open || !listId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void loadEmployees(listId, search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, open, listId, loadEmployees]);

  const toggleId = (userId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === employees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(employees.map(e => e.userId)));
    }
  };

  const handleAssign = async () => {
    if (!listId) return;
    if (selectedIds.size === 0) {
      toast.error('Select at least one employee');
      return;
    }
    setIsAssigning(true);
    try {
      const res = await assignEmployees(listId, Array.from(selectedIds));
      toast.success(
        `${res.data.assigned} employee${res.data.assigned !== 1 ? 's' : ''} assigned`
      );
      onOpenChange(false);
      await onAssigned();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Employees to &quot;{planName}&quot;</DialogTitle>
          <DialogDescription>
            Search and select employees to assign to this holiday plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-72 overflow-y-auto rounded-md border">
            {isLoading ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Loading...
              </p>
            ) : employees.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {search
                  ? 'No matching employees found'
                  : 'All employees are already assigned'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          selectedIds.size === employees.length &&
                          employees.length > 0
                        }
                        onCheckedChange={() => toggleAll()}
                      />
                    </TableHead>
                    <TableHead>Emp. Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.userId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(emp.userId)}
                          onCheckedChange={() => toggleId(emp.userId)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {emp.employeeNumber || '—'}
                      </TableCell>
                      <TableCell>
                        {emp.displayName ||
                          `${emp.user.firstName} ${emp.user.lastName}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {emp.user.email}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {employees.length > 0 && (
            <p className="text-muted-foreground text-sm">
              {selectedIds.size} employee{selectedIds.size !== 1 ? 's' : ''}{' '}
              selected
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isAssigning || selectedIds.size === 0}
          >
            {isAssigning
              ? 'Assigning...'
              : `Assign Selected (${selectedIds.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   Unassign Employee Dialog
   ═══════════════════════════════════════════════ */

function UnassignEmployeeDialog({
  employee,
  onOpenChange,
  listId,
  planName,
  onUnassigned,
}: {
  employee: AssignedEmployee | null;
  onOpenChange: (v: boolean) => void;
  listId: string | null;
  planName: string;
  onUnassigned: () => Promise<void>;
}) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (!listId || !employee) return;
    setRemoving(true);
    try {
      await unassignEmployees(listId, [employee.userId]);
      toast.success('Employee removed from holiday plan');
      onOpenChange(false);
      await onUnassigned();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setRemoving(false);
    }
  };

  const displayName = employee
    ? employee.displayName ||
      `${employee.user.firstName} ${employee.user.lastName}`
    : '';

  return (
    <Dialog open={!!employee} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Employee</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove &quot;{displayName}&quot; from the
            holiday plan &quot;{planName}&quot;? They will fall back to the
            default plan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
