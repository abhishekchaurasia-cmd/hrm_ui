'use client';

import { ShieldAlert, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

import { AssignEmployeesDialog } from '../components/assign-employees-dialog';
import {
  usePenalizationPolicies,
  usePolicyAssignments,
} from '../hooks/use-penalization-policies';

export function PenalizationPolicyAssignmentScreen() {
  const { data: policiesData, isLoading: policiesLoading } =
    usePenalizationPolicies();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [search, setSearch] = useState('');

  const policies = policiesData?.data ?? [];

  const { data: assignmentsData, isLoading: assignmentsLoading } =
    usePolicyAssignments(selectedPolicyId || null);
  const assignments = assignmentsData?.data?.items ?? [];

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
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Policy Assignments</h1>
        <p className="text-muted-foreground text-sm">
          Manage employee assignments to penalization policies.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="size-5" />
              Assignments
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select
                value={selectedPolicyId}
                onValueChange={setSelectedPolicyId}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a policy..." />
                </SelectTrigger>
                <SelectContent>
                  {policiesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    policies.map(policy => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedPolicyId && (
                <Button size="sm" onClick={() => setShowAssignDialog(true)}>
                  <UserPlus className="mr-1 size-4" />
                  Assign
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedPolicyId ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Select a policy to view and manage assignments.
            </p>
          ) : assignmentsLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading assignments...
            </p>
          ) : (
            <>
              <div className="mb-4">
                <Input
                  placeholder="Search employees..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              {filtered.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(assignment => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.user?.firstName}{' '}
                            {assignment.user?.lastName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {assignment.user?.email}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              assignment.assignedAt
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                assignment.isActive ? 'success' : 'secondary'
                              }
                            >
                              {assignment.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedPolicyId && (
        <AssignEmployeesDialog
          policyId={selectedPolicyId}
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
        />
      )}
    </div>
  );
}
