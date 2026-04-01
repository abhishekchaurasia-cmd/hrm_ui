'use client';

import axios from 'axios';
import { CalendarDays, PlusCircle, Send, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

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
import { Pagination } from '@/components/ui/pagination';
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
import { Textarea } from '@/components/ui/textarea';
import { LeaveRequestsScreen } from '@/features/admin/leave-requests/screens/leave-requests-screen';
import {
  applyLeave,
  cancelLeaveRequest,
  getAvailableLeaveTypes,
  getMyLeaveBalances,
  getMyLeaveRequests,
} from '@/services/leaves';

import type {
  AvailableLeaveType,
  HalfDayType,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestStatus,
} from '@/types/leave';

const STATUS_VARIANTS: Record<
  string,
  'default' | 'success' | 'warning' | 'destructive' | 'secondary'
> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'secondary',
};

const STATUS_FILTERS: { label: string; value: LeaveRequestStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function BalanceProgress({
  used,
  allocated,
}: {
  used: number;
  allocated: number;
}) {
  const pct = allocated > 0 ? Math.min((used / allocated) * 100, 100) : 0;
  return (
    <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
      <div
        className="h-full rounded-full bg-orange-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function LeaveScreen() {
  const { data: session } = useSession();
  const isHrUser = session?.user?.role === 'hr';
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [availableTypes, setAvailableTypes] = useState<AvailableLeaveType[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeaveRequestStatus | 'all'>(
    'all'
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  });

  const [unpaidInfo, setUnpaidInfo] = useState<AvailableLeaveType | null>(null);

  const [form, setForm] = useState({
    leaveTypeConfigId: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDayType: '' as HalfDayType | '',
  });

  const fetchData = useCallback(async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const [balRes, leaveRes, typesRes] = await Promise.all([
        getMyLeaveBalances(selectedYear).catch(() => ({
          data: [] as LeaveBalance[],
        })),
        getMyLeaveRequests({
          page,
          limit,
          status: statusFilter === 'all' ? undefined : statusFilter,
        }).catch(() => ({
          data: {
            leaves: [] as LeaveRequest[],
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
            statusCounts: {},
          },
        })),
        getAvailableLeaveTypes().catch(() => null),
      ]);
      const rawBal = balRes.data;
      setBalances(Array.isArray(rawBal) ? rawBal : []);

      if (typesRes?.data?.leaveTypes) {
        const types = typesRes.data.leaveTypes;
        setAvailableTypes(types);
        const unpaid = types.find(t => t.isUnlimited && !t.isPaid);
        setUnpaidInfo(unpaid ?? null);
      }

      const leaveData = leaveRes.data;
      if (
        leaveData &&
        'leaves' in leaveData &&
        Array.isArray(leaveData.leaves)
      ) {
        setLeaves(leaveData.leaves);
        setTotal(leaveData.total ?? 0);
        setTotalPages(leaveData.totalPages ?? 1);
        if (leaveData.statusCounts) {
          setStatusCounts(leaveData.statusCounts);
        }
      } else if (Array.isArray(leaveData)) {
        setLeaves(leaveData);
      } else {
        setLeaves([]);
      }
    } catch {
      toast.error('Failed to load leave data');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user, selectedYear, page, limit, statusFilter]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const openApplyDialog = async () => {
    setShowApply(true);
    if (availableTypes.length === 0) {
      try {
        const res = await getAvailableLeaveTypes();
        setAvailableTypes(res.data?.leaveTypes ?? []);
      } catch {
        toast.error('Failed to load leave types');
      }
    }
  };

  const handleApply = async () => {
    if (!form.leaveTypeConfigId || !form.startDate || !form.endDate) {
      toast.error('Please select a leave type and enter dates');
      return;
    }
    if (form.isHalfDay && !form.halfDayType) {
      toast.error('Please select first half or second half');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await applyLeave({
        leaveTypeConfigId: form.leaveTypeConfigId,
        startDate: form.startDate,
        endDate: form.isHalfDay ? form.startDate : form.endDate,
        reason: form.reason || undefined,
        isHalfDay: form.isHalfDay || undefined,
        halfDayType: (form.isHalfDay && form.halfDayType
          ? form.halfDayType
          : undefined) as HalfDayType | undefined,
      });
      toast.success(res.message || 'Leave request submitted');
      setShowApply(false);
      setForm({
        leaveTypeConfigId: '',
        startDate: '',
        endDate: '',
        reason: '',
        isHalfDay: false,
        halfDayType: '',
      });
      void fetchData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to apply leave')
        : 'Failed to apply leave';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelLeaveRequest(id);
      toast.success('Leave request cancelled');
      void fetchData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to cancel leave')
        : 'Failed to cancel leave';
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  const paidBalances = balances.filter(
    b => !(b.leaveTypeConfig?.isUnlimited && !b.leaveTypeConfig?.isPaid)
  );
  const totalAllocated = paidBalances.reduce(
    (sum, b) => sum + Number(b.allocated),
    0
  );
  const totalUsed = paidBalances.reduce((sum, b) => sum + Number(b.used), 0);
  const totalBalance = paidBalances.reduce(
    (sum, b) => sum + Number(b.balance),
    0
  );
  const totalCarried = paidBalances.reduce(
    (sum, b) => sum + Number(b.carriedForward),
    0
  );

  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

  const pendingCount = statusCounts.pending ?? 0;

  if (isHrUser) {
    return <LeaveRequestsScreen />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground text-sm">
            View balances, apply for leave, and track requests.
          </p>
        </div>
        <Button
          className="gap-2 bg-orange-500 text-white hover:bg-orange-600"
          onClick={() => void openApplyDialog()}
        >
          <PlusCircle className="size-4" />
          Apply Leave
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="border-muted-foreground size-8 animate-spin rounded-full border-4 border-t-orange-500" />
        </div>
      ) : (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="my-leaves" className="gap-1.5">
              My Leaves
              {pendingCount > 0 && (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ──────────── Summary Tab ──────────── */}
          <TabsContent value="summary" className="space-y-5">
            {/* Year Selector */}
            <div className="flex justify-end">
              <Select
                value={String(selectedYear)}
                onValueChange={v => setSelectedYear(Number(v))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(y => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aggregate Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="py-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Total Allocated
                  </p>
                  <p className="mt-1 text-3xl font-bold">{totalAllocated}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Used
                  </p>
                  <p className="mt-1 text-3xl font-bold text-orange-500">
                    {totalUsed}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Available Balance
                  </p>
                  <p className="mt-1 text-3xl font-bold text-green-500">
                    {totalBalance}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Carried Forward
                  </p>
                  <p className="mt-1 text-3xl font-bold text-blue-500">
                    {totalCarried}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Per-type Balance Cards */}
            {balances.length > 0 || unpaidInfo ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {balances.map(b => {
                  const alloc = Number(b.allocated);
                  const used = Number(b.used);
                  const bal = Number(b.balance);
                  const isUnlimitedType = b.leaveTypeConfig?.isUnlimited;
                  return (
                    <Card key={b.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-sm font-medium">
                          <span>{b.leaveTypeConfig?.name ?? 'Leave'}</span>
                          <div className="flex items-center gap-1.5">
                            {isUnlimitedType && (
                              <Badge className="bg-purple-100 text-[10px] text-purple-700 hover:bg-purple-100">
                                Unlimited
                              </Badge>
                            )}
                            {b.leaveTypeConfig?.code && (
                              <Badge variant="outline" className="text-xs">
                                {b.leaveTypeConfig.code}
                              </Badge>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        {isUnlimitedType ? (
                          <>
                            <div className="flex items-baseline justify-between">
                              <span className="text-3xl font-bold">∞</span>
                              <span className="text-muted-foreground text-xs">
                                No limit
                              </span>
                            </div>
                            <div className="text-muted-foreground pt-1 text-xs">
                              Used: {used}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline justify-between">
                              <span className="text-3xl font-bold">{bal}</span>
                              <span className="text-muted-foreground text-xs">
                                of {alloc} remaining
                              </span>
                            </div>
                            <BalanceProgress used={used} allocated={alloc} />
                            <div className="text-muted-foreground flex justify-between pt-1 text-xs">
                              <span>Used: {used}</span>
                              {Number(b.carriedForward) > 0 && (
                                <span>CF: {Number(b.carriedForward)}</span>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {unpaidInfo && (
                  <Card className="border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-sm font-medium">
                        <span>{unpaidInfo.name}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-amber-100 text-[10px] text-amber-700 hover:bg-amber-100">
                            Unpaid
                          </Badge>
                          <Badge className="bg-purple-100 text-[10px] text-purple-700 hover:bg-purple-100">
                            Unlimited
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold">∞</span>
                        <span className="text-muted-foreground text-xs">
                          No limit
                        </span>
                      </div>
                      <div className="text-muted-foreground pt-1 text-xs">
                        Used this year: {unpaidInfo.used}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10">
                  <p className="text-muted-foreground text-center text-sm">
                    No leave plan assigned. Contact HR to assign a leave plan.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ──────────── My Leaves Tab ──────────── */}
          <TabsContent value="my-leaves" className="space-y-4">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => {
                    setStatusFilter(f.value);
                    setPage(1);
                  }}
                  className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === f.value
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {f.label}
                  {f.value !== 'all' && (
                    <span className="ml-1.5 opacity-70">
                      {statusCounts[f.value] ?? 0}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Leave Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="size-5" />
                  Leave Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaves.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    {statusFilter === 'all'
                      ? 'No leave requests yet.'
                      : `No ${statusFilter} leave requests.`}
                  </p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Leave Type</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Days</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied On</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaves.map(l => (
                          <TableRow key={l.id}>
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                {l.leaveTypeConfig ? (
                                  <Badge variant="outline" className="w-fit">
                                    {l.leaveTypeConfig.name}
                                  </Badge>
                                ) : l.leaveType === 'unpaid' ? (
                                  <Badge className="w-fit bg-amber-100 text-amber-700 hover:bg-amber-100">
                                    Unpaid Leave
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    {l.leaveType ?? '-'}
                                  </span>
                                )}
                                {l.isHalfDay && (
                                  <span className="text-muted-foreground text-[10px]">
                                    {l.halfDayType === 'first_half'
                                      ? 'First Half'
                                      : 'Second Half'}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {formatDate(l.startDate)}
                              {l.startDate !== l.endDate &&
                                ` — ${formatDate(l.endDate)}`}
                            </TableCell>
                            <TableCell className="font-medium">
                              {l.numberOfDays}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm">
                              {l.reason || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  STATUS_VARIANTS[l.status] ?? 'secondary'
                                }
                              >
                                {l.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {formatDate(l.createdAt)}
                            </TableCell>
                            <TableCell>
                              {(l.status === 'pending' ||
                                l.status === 'approved') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive h-7 gap-1 px-2 text-xs"
                                  disabled={cancellingId === l.id}
                                  onClick={() => void handleCancel(l.id)}
                                >
                                  <XCircle className="size-3" />
                                  {cancellingId === l.id
                                    ? 'Cancelling...'
                                    : 'Cancel'}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      total={total}
                      limit={limit}
                      onPageChange={setPage}
                      onLimitChange={v => {
                        setLimit(v);
                        setPage(1);
                      }}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* ──────────── Apply Leave Dialog ──────────── */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5" />
              Apply for Leave
            </DialogTitle>
            <DialogDescription>
              Select a leave type, pick dates, and submit your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Leave Type */}
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select
                value={form.leaveTypeConfigId}
                onValueChange={v =>
                  setForm(p => ({ ...p, leaveTypeConfigId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                      {t.isUnlimited
                        ? ' (Unlimited)'
                        : ` (${t.balance} remaining)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableTypes.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  Loading leave types...
                </p>
              )}
            </div>

            {/* Half-day Toggle */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm(p => ({
                      ...p,
                      isHalfDay: false,
                      halfDayType: '',
                    }))
                  }
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    !form.isHalfDay
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  Full Day
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm(p => ({
                      ...p,
                      isHalfDay: true,
                      halfDayType: 'first_half',
                    }))
                  }
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    form.isHalfDay
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  Half Day
                </button>
              </div>
            </div>

            {/* Half-day type selector */}
            {form.isHalfDay && (
              <div className="space-y-2">
                <Label>Select Half</Label>
                <Select
                  value={form.halfDayType}
                  onValueChange={v =>
                    setForm(p => ({
                      ...p,
                      halfDayType: v as HalfDayType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select half" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_half">
                      First Half (Morning)
                    </SelectItem>
                    <SelectItem value="second_half">
                      Second Half (Afternoon)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Fields */}
            <div
              className={`grid gap-4 ${form.isHalfDay ? 'grid-cols-1' : 'grid-cols-2'}`}
            >
              <div className="space-y-2">
                <Label>{form.isHalfDay ? 'Date' : 'Start Date'}</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={e =>
                    setForm(p => ({ ...p, startDate: e.target.value }))
                  }
                />
              </div>
              {!form.isHalfDay && (
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={e =>
                      setForm(p => ({ ...p, endDate: e.target.value }))
                    }
                  />
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter leave reason (optional)"
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApply(false)}>
              Cancel
            </Button>
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => void handleApply()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
