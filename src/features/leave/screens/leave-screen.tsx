'use client';

import axios from 'axios';
import { CalendarDays, PlusCircle, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import service, { HttpMethod } from '@/services/http';
import { getEmployeeBalances } from '@/services/leave-balances';

import type { LeaveBalance } from '@/types/leave';

interface LeaveRequest {
  id: string;
  leaveType: string | null;
  leaveTypeConfigId: string | null;
  numberOfDays: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

const STATUS_VARIANTS: Record<
  string,
  'default' | 'success' | 'warning' | 'destructive' | 'secondary'
> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'secondary',
};

export function LeaveScreen() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    leaveTypeConfigId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [balRes, leaveRes] = await Promise.all([
        getEmployeeBalances(userId).catch(() => ({
          data: [] as LeaveBalance[],
        })),
        service({ method: HttpMethod.GET, url: '/api/v1/leaves' }).catch(
          () => ({ data: { data: [] as LeaveRequest[] } })
        ),
      ]);
      setBalances(balRes.data);

      const leaveData = leaveRes.data as { data: LeaveRequest[] };
      setLeaves(leaveData.data ?? []);
    } catch {
      toast.error('Failed to load leave data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleApply = async () => {
    if (!form.startDate || !form.endDate || !form.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
      };

      if (form.leaveTypeConfigId) {
        payload.leaveTypeConfigId = form.leaveTypeConfigId;
      }

      const res = await service({
        method: HttpMethod.POST,
        url: '/api/v1/leaves',
        data: payload,
      });
      const responseData = res.data as { message: string };
      toast.success(responseData.message);
      setShowApply(false);
      setForm({
        leaveTypeConfigId: '',
        startDate: '',
        endDate: '',
        reason: '',
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

  const totalBalance = balances.reduce((sum, b) => sum + Number(b.balance), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave</h1>
          <p className="text-muted-foreground">
            Apply and track your leave requests.
          </p>
        </div>
        <Button
          className="gap-2 bg-orange-500 text-white hover:bg-orange-600"
          onClick={() => setShowApply(true)}
        >
          <PlusCircle className="size-4" />
          Apply Leave
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Loading...
        </p>
      ) : (
        <>
          {balances.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {balances.map(b => (
                <Card key={b.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm font-medium">
                      {b.leaveTypeConfig?.name ?? 'Leave'}
                      {b.leaveTypeConfig?.code && (
                        <code className="text-muted-foreground text-xs">
                          {b.leaveTypeConfig.code}
                        </code>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Number(b.balance)}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Allocated: {Number(b.allocated)} | Used: {Number(b.used)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="size-5" />
                  Leave Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Available
                  </p>
                  <p className="text-3xl font-bold">{totalBalance || '—'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {leaves.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map(l => (
                      <TableRow key={l.id}>
                        <TableCell className="whitespace-nowrap">
                          {l.startDate} — {l.endDate}
                        </TableCell>
                        <TableCell>{Number(l.numberOfDays)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {l.reason}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={STATUS_VARIANTS[l.status] ?? 'secondary'}
                          >
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(l.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5" />
              Apply for Leave
            </DialogTitle>
            <DialogDescription>
              Select a leave type and enter your leave dates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {balances.length > 0 && (
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
                    {balances.map(b => (
                      <SelectItem
                        key={b.leaveTypeConfigId}
                        value={b.leaveTypeConfigId}
                      >
                        {b.leaveTypeConfig?.name ?? 'Leave'} (Balance:{' '}
                        {Number(b.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={e =>
                    setForm(p => ({ ...p, startDate: e.target.value }))
                  }
                />
              </div>
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
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter leave reason"
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApply(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
