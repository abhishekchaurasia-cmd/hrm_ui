'use client';

import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { Pagination, type PaginatedResponse } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getShifts, deactivateShift } from '@/services/shifts';

import type { Shift } from '@/types/shift';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatWeeklyOffs(shift: Shift): string {
  if (!shift.weeklyOffs || shift.weeklyOffs.length === 0) return 'None';
  return shift.weeklyOffs.map(wo => DAY_NAMES[wo.dayOfWeek]).join(', ');
}

export function ShiftListScreen() {
  const router = useRouter();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchShifts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getShifts({ page, limit });
      const data = res.data as unknown as PaginatedResponse<Shift>;
      setShifts(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setError('Failed to load shifts');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void fetchShifts();
  }, [fetchShifts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deactivateShift(deleteTarget.id);
      toast.success('Shift deactivated');
      setDeleteTarget(null);
      void fetchShifts();
    } catch {
      toast.error('Failed to deactivate shift');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shift Management</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage employee shifts
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/admin/shifts/new')}>
          <Plus className="size-4" />
          Create Shift
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            All Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading shifts...
            </p>
          ) : error ? (
            <p className="text-destructive py-8 text-center text-sm">{error}</p>
          ) : shifts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Clock className="text-muted-foreground/50 size-12" />
              <p className="text-muted-foreground text-sm">
                No shifts configured yet
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/admin/shifts/new')}
              >
                <Plus className="size-4" />
                Create your first shift
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead>Work Hours</TableHead>
                    <TableHead>Grace</TableHead>
                    <TableHead>Weekly Offs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map(shift => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">
                        {shift.name}
                        {shift.isDefault && (
                          <Badge variant="secondary" className="ml-2">
                            Default
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                          {shift.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {shift.startTime.slice(0, 5)} -{' '}
                        {shift.endTime.slice(0, 5)}
                      </TableCell>
                      <TableCell>{Number(shift.workHoursPerDay)}h</TableCell>
                      <TableCell>{shift.graceMinutes}m</TableCell>
                      <TableCell>{formatWeeklyOffs(shift)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={shift.isActive ? 'success' : 'secondary'}
                        >
                          {shift.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              router.push(`/dashboard/admin/shifts/${shift.id}`)
                            }
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDeleteTarget(shift)}
                          >
                            <Trash2 className="text-destructive size-3.5" />
                          </Button>
                        </div>
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
                onLimitChange={setLimit}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate &quot;{deleteTarget?.name}
              &quot;? Employees assigned to this shift will need to be
              reassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
