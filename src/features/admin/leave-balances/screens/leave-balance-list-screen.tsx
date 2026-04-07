'use client';

import axios from 'axios';
import { Wallet, SlidersHorizontal, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import { EmployeeSelect } from '@/components/employee-select';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  getLeaveBalanceOverview,
  adjustBalance,
} from '@/services/leave-balances';

import type {
  EmployeeBalanceRow,
  LeaveBalance,
  LeaveTypeColumn,
} from '@/types/leave';

export function LeaveBalanceListScreen() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeBalanceRow[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<string>(
    String(new Date().getFullYear())
  );
  const [filterUserId, setFilterUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showEdit, setShowEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeBalanceRow | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editRemarks, setEditRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (filterYear) params.year = parseInt(filterYear, 10);
      if (filterUserId) params.search = undefined;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterUserId) {
        params.search = undefined;
      }
      const res = await getLeaveBalanceOverview(
        params as {
          year?: number;
          search?: string;
          page?: number;
          limit?: number;
        }
      );
      const overview = res.data;
      setLeaveTypes(overview.leaveTypes);
      setEmployees(overview.employees.items);
      setTotal(overview.employees.total);
      setTotalPages(overview.employees.totalPages);
    } catch {
      toast.error('Failed to load balances');
    } finally {
      setIsLoading(false);
    }
  }, [filterYear, filterUserId, searchTerm, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [filterYear, filterUserId, searchTerm]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  const filteredEmployees = useMemo(() => {
    if (!filterUserId) return employees;
    return employees.filter(e => e.userId === filterUserId);
  }, [employees, filterUserId]);

  const getBalanceForType = (
    row: EmployeeBalanceRow,
    leaveTypeId: string
  ): LeaveBalance | undefined => {
    return row.balances.find(b => b.leaveTypeConfigId === leaveTypeId);
  };

  const openEditDialog = (row: EmployeeBalanceRow) => {
    setEditTarget(row);
    const values: Record<string, string> = {};
    for (const b of row.balances) {
      values[b.id] = String(Number(b.balance));
    }
    setEditValues(values);
    setEditRemarks('');
    setShowEdit(true);
  };

  const handleSave = async () => {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      const adjustments: Array<{ leaveBalanceId: string; days: number }> = [];
      for (const b of editTarget.balances) {
        const newVal = parseFloat(editValues[b.id] ?? '');
        if (isNaN(newVal)) continue;
        const currentBalance = Number(b.balance);
        const delta = newVal - currentBalance;
        if (Math.abs(delta) >= 0.1) {
          adjustments.push({ leaveBalanceId: b.id, days: delta });
        }
      }

      if (adjustments.length === 0) {
        toast.info('No changes to save');
        setShowEdit(false);
        return;
      }

      const results = await Promise.allSettled(
        adjustments.map(adj =>
          adjustBalance({
            leaveBalanceId: adj.leaveBalanceId,
            days: adj.days,
            remarks: editRemarks || undefined,
          })
        )
      );

      const failed = results.filter(r => r.status === 'rejected').length;
      if (failed > 0) {
        toast.error(`${failed} adjustment(s) failed`);
      } else {
        toast.success('Leave balances updated');
      }

      setShowEdit(false);
      setEditTarget(null);
      void fetchOverview();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to save changes')
        : 'Failed to save changes';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const totalAvailable = editTarget
    ? editTarget.balances.reduce((sum, b) => sum + Number(b.balance), 0)
    : 0;
  const totalAllocated = editTarget
    ? editTarget.balances.reduce((sum, b) => sum + Number(b.allocated), 0)
    : 0;

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
              <Label className="text-xs">Employee</Label>
              <EmployeeSelect
                value={filterUserId}
                onValueChange={setFilterUserId}
                placeholder="All employees"
                allowClear
                className="w-72"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Input
                  className="w-60 pr-8"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="size-3.5" />
                  </button>
                )}
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
          ) : filteredEmployees.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No balance records found. Initialize balances from a leave plan.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Employee</TableHead>
                      {leaveTypes.map(lt => (
                        <TableHead key={lt.id} className="text-center">
                          <div>
                            <p>{lt.name}</p>
                            <p className="text-muted-foreground text-[10px] font-normal uppercase">
                              {lt.code}
                            </p>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map(row => (
                      <TableRow key={row.userId}>
                        <TableCell>
                          <button
                            type="button"
                            className="text-left hover:underline"
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/leave-balances/employee/${row.userId}`
                              )
                            }
                          >
                            <p className="font-medium">
                              {row.user.firstName} {row.user.lastName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {row.user.email}
                            </p>
                          </button>
                        </TableCell>
                        {leaveTypes.map(lt => {
                          const bal = getBalanceForType(row, lt.id);
                          if (!bal) {
                            return (
                              <TableCell
                                key={lt.id}
                                className="text-muted-foreground text-center"
                              >
                                -
                              </TableCell>
                            );
                          }
                          return (
                            <TableCell key={lt.id} className="text-center">
                              <span className="font-medium">
                                {Number(bal.used)}/{Number(bal.allocated)}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {' '}
                                days
                              </span>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => openEditDialog(row)}
                          >
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {!filterUserId && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={setLimit}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Leave Balance</DialogTitle>
            <DialogDescription>
              {editTarget && (
                <span className="flex flex-col gap-0.5">
                  <span className="text-foreground font-medium">
                    {editTarget.user.firstName} {editTarget.user.lastName}
                  </span>
                  <span>{editTarget.user.email}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {editTarget && (
            <div className="space-y-5">
              <div className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3">
                <span className="text-sm font-medium">
                  Total available balance
                </span>
                <span className="text-lg font-bold">
                  {totalAvailable} / {totalAllocated} days
                </span>
              </div>

              <div className="space-y-3">
                {editTarget.balances.map(b => (
                  <div key={b.id} className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      {b.leaveTypeConfig?.name ?? 'Unknown'}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.5"
                        className="w-24"
                        value={editValues[b.id] ?? ''}
                        onChange={e =>
                          setEditValues(prev => ({
                            ...prev,
                            [b.id]: e.target.value,
                          }))
                        }
                      />
                      <span className="text-muted-foreground text-sm">
                        days
                      </span>
                      <span className="text-muted-foreground text-sm">
                        / {Number(b.allocated)} days
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Comment</Label>
                <Textarea
                  placeholder="Add Comment"
                  value={editRemarks}
                  onChange={e => setEditRemarks(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
