'use client';

import { Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { AssignEmployeesDialog } from './assign-employees-dialog';
import {
  useTimeTrackingPolicyAssignments,
  useUnassignEmployeeFromPolicy,
} from '../hooks/use-time-tracking-policies';

interface PolicyEmployeesTabProps {
  policyId: string;
}

export function PolicyEmployeesTab({ policyId }: PolicyEmployeesTabProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data, isLoading } = useTimeTrackingPolicyAssignments(policyId, {
    page,
    limit,
  });
  const unassignMutation = useUnassignEmployeeFromPolicy(policyId);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [search, setSearch] = useState('');

  const paginated = data?.data;
  const assignments = paginated?.items ?? [];
  const total = paginated?.total ?? 0;
  const totalPages = paginated?.totalPages ?? 1;
  const filtered = assignments.filter(a => {
    if (!search) return true;
    const name =
      `${a.user?.firstName ?? ''} ${a.user?.lastName ?? ''}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      (a.user?.email ?? '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" onClick={() => setShowAssignDialog(true)}>
          <UserPlus className="mr-1 size-4" />
          Assign Employees
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading assignments...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No employees assigned to this policy.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(assignment => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    {assignment.user?.firstName} {assignment.user?.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {assignment.user?.email}
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={assignment.isActive ? 'success' : 'secondary'}
                    >
                      {assignment.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setUnassignTarget({
                          id: assignment.id,
                          name: `${assignment.user?.firstName} ${assignment.user?.lastName}`,
                        })
                      }
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && total > 0 && (
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
          )}
        </div>
      )}

      <Dialog
        open={!!unassignTarget}
        onOpenChange={open => !open && setUnassignTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unassign Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to unassign{' '}
              <strong>{unassignTarget?.name}</strong> from this policy?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnassignTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={unassignMutation.isPending}
              onClick={() => {
                if (unassignTarget) {
                  unassignMutation.mutate(unassignTarget.id, {
                    onSuccess: () => setUnassignTarget(null),
                  });
                }
              }}
            >
              {unassignMutation.isPending ? 'Removing...' : 'Unassign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssignEmployeesDialog
        policyId={policyId}
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
      />
    </div>
  );
}
