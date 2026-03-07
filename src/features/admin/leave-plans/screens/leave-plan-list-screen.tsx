'use client';

import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getLeavePlans, deactivateLeavePlan } from '@/services/leave-plans';

import type { LeavePlan } from '@/types/leave';

export function LeavePlanListScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState<LeavePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeavePlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getLeavePlans();
      setPlans(res.data);
    } catch {
      setError('Failed to load leave plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlans();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deactivateLeavePlan(deleteTarget.id);
      toast.success('Leave plan deactivated');
      setDeleteTarget(null);
      void fetchPlans();
    } catch {
      toast.error('Failed to deactivate leave plan');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leave Plans</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage leave policies
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/admin/leave-plans/new')}>
          <Plus className="size-4" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            All Leave Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading leave plans...
            </p>
          ) : error ? (
            <p className="text-destructive py-8 text-center text-sm">{error}</p>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <FileText className="text-muted-foreground/50 size-12" />
              <p className="text-muted-foreground text-sm">
                No leave plans created yet
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/admin/leave-plans/new')}
              >
                <Plus className="size-4" />
                Create your first plan
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Leave Types</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.year}</TableCell>
                    <TableCell>
                      {plan.startDate} — {plan.endDate}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {plan.leaveTypeConfigs?.length ?? 0} types
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            router.push(
                              `/dashboard/admin/leave-plans/${plan.id}`
                            )
                          }
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDeleteTarget(plan)}
                        >
                          <Trash2 className="text-destructive size-3.5" />
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

      <Dialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Leave Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate &quot;{deleteTarget?.name}
              &quot;? This will not affect existing balances.
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
