'use client';

import axios from 'axios';
import { Wallet, Search, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { getLeaveBalances, adjustBalance } from '@/services/leave-balances';

import type { LeaveBalance } from '@/types/leave';

export function LeaveBalanceListScreen() {
  const router = useRouter();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<string>(
    String(new Date().getFullYear())
  );
  const [filterUserId, setFilterUserId] = useState('');

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<LeaveBalance | null>(null);
  const [adjustDays, setAdjustDays] = useState('');
  const [adjustRemarks, setAdjustRemarks] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchBalances = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (filterYear) params.year = parseInt(filterYear, 10);
      if (filterUserId) params.userId = filterUserId;
      const res = await getLeaveBalances(
        params as { userId?: string; planId?: string; year?: number }
      );
      setBalances(res.data);
    } catch {
      toast.error('Failed to load balances');
    } finally {
      setIsLoading(false);
    }
  }, [filterYear, filterUserId]);

  useEffect(() => {
    void fetchBalances();
  }, [fetchBalances]);

  const handleAdjust = async () => {
    if (!adjustTarget || !adjustDays) {
      toast.error('Days amount is required');
      return;
    }
    setIsAdjusting(true);
    try {
      const res = await adjustBalance({
        leaveBalanceId: adjustTarget.id,
        days: parseFloat(adjustDays),
        remarks: adjustRemarks || undefined,
      });
      toast.success(res.message);
      setShowAdjust(false);
      setAdjustTarget(null);
      setAdjustDays('');
      setAdjustRemarks('');
      void fetchBalances();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to adjust balance')
        : 'Failed to adjust balance';
      toast.error(message);
    } finally {
      setIsAdjusting(false);
    }
  };

  const openAdjustDialog = (balance: LeaveBalance) => {
    setAdjustTarget(balance);
    setAdjustDays('');
    setAdjustRemarks('');
    setShowAdjust(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leave Balances</h1>
          <p className="text-muted-foreground text-sm">
            View and manage employee leave balances
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            router.push('/dashboard/admin/leave-balances/transactions')
          }
        >
          Transaction Log
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Year</Label>
              <Input
                type="number"
                className="w-28"
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Employee ID</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Filter by employee UUID"
                  className="w-72"
                  value={filterUserId}
                  onChange={e => setFilterUserId(e.target.value)}
                />
                <Button size="icon" variant="outline" onClick={fetchBalances}>
                  <Search className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5" />
            Balance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading balances...
            </p>
          ) : balances.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No balance records found. Initialize balances from a leave plan.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Carried</TableHead>
                  <TableHead className="text-right">Adjusted</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>
                      {b.user ? (
                        <button
                          type="button"
                          className="text-left hover:underline"
                          onClick={() =>
                            router.push(
                              `/dashboard/admin/leave-balances/employee/${b.userId}`
                            )
                          }
                        >
                          <p className="font-medium">
                            {b.user.firstName} {b.user.lastName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {b.user.email}
                          </p>
                        </button>
                      ) : (
                        <span className="text-xs">{b.userId}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {b.leaveTypeConfig?.name ?? '—'}
                        </p>
                        {b.leaveTypeConfig?.code && (
                          <code className="text-muted-foreground text-xs">
                            {b.leaveTypeConfig.code}
                          </code>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(b.allocated)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(b.used)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(b.carriedForward)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(b.adjusted) !== 0 ? (
                        <Badge
                          variant={
                            Number(b.adjusted) > 0 ? 'success' : 'warning'
                          }
                        >
                          {Number(b.adjusted) > 0 ? '+' : ''}
                          {Number(b.adjusted)}
                        </Badge>
                      ) : (
                        '0'
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {Number(b.balance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => openAdjustDialog(b)}
                      >
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdjust} onOpenChange={setShowAdjust}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Leave Balance</DialogTitle>
            <DialogDescription>
              {adjustTarget &&
                `Adjusting balance for ${
                  adjustTarget.leaveTypeConfig?.name ?? 'leave type'
                }. Use positive values to credit, negative to debit.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Days (+ to credit, - to debit)</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="e.g. 2 or -1"
                value={adjustDays}
                onChange={e => setAdjustDays(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Remarks (optional)</Label>
              <Textarea
                placeholder="Reason for adjustment"
                value={adjustRemarks}
                onChange={e => setAdjustRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjust(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjust} disabled={isAdjusting}>
              {isAdjusting ? 'Adjusting...' : 'Apply Adjustment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
