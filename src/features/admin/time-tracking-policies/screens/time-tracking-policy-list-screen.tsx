'use client';

import { Pencil, Plus, Search, Timer, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PolicyConfigDialog } from '../components/policy-config-dialog';
import { PolicyEmployeesTab } from '../components/policy-employees-tab';
import { PolicySummaryTab } from '../components/policy-summary-tab';
import { SetupWizardDialog } from '../components/setup-wizard-dialog';
import {
  useDeleteTimeTrackingPolicy,
  useTimeTrackingPolicies,
} from '../hooks/use-time-tracking-policies';

import type { TimeTrackingPolicy } from '@/types/time-tracking-policy';

export function TimeTrackingPolicyListScreen() {
  const { data, isLoading } = useTimeTrackingPolicies();
  const deleteMutation = useDeleteTimeTrackingPolicy();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimeTrackingPolicy | null>(
    null
  );
  const [search, setSearch] = useState('');

  const policies = data?.data ?? [];
  const filtered = policies.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const selectedPolicy = policies.find(p => p.id === selectedPolicyId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Time Tracking Policy</h1>
          <p className="text-muted-foreground text-sm">
            Here you can manage the way you capture attendance of your
            employees.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-1 size-4" />
          Add Time Tracking Policy
        </Button>
      </div>

      <div className="flex gap-5">
        <div className="w-72 shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                <Input
                  placeholder="Search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 p-2">
              {isLoading ? (
                <p className="text-muted-foreground p-4 text-center text-sm">
                  Loading...
                </p>
              ) : filtered.length === 0 ? (
                <p className="text-muted-foreground p-4 text-center text-sm">
                  No policies found.
                </p>
              ) : (
                filtered.map(policy => (
                  <button
                    type="button"
                    key={policy.id}
                    onClick={() => setSelectedPolicyId(policy.id)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      selectedPolicyId === policy.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{policy.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {policy.employeeCount ?? 0} employee
                        {(policy.employeeCount ?? 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {policy.isDefault && (
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        DEFAULT
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {selectedPolicy ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedPolicy.name}</CardTitle>
                    {selectedPolicy.description && (
                      <CardDescription>
                        {selectedPolicy.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfigDialog(true)}
                    >
                      <Pencil className="mr-1 size-4" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setDeleteTarget(selectedPolicy)}
                    >
                      <Trash2 className="mr-1 size-4" />
                      Deactivate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="mt-4">
                    <PolicySummaryTab policy={selectedPolicy} />
                  </TabsContent>
                  <TabsContent value="employees" className="mt-4">
                    <PolicyEmployeesTab policyId={selectedPolicy.id} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Timer className="text-muted-foreground mb-4 size-12" />
                <h3 className="text-lg font-medium">
                  Select a policy to view details
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Choose a time tracking policy from the list or create a new
                  one.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <SetupWizardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={policyId => setSelectedPolicyId(policyId)}
      />

      {selectedPolicy && (
        <PolicyConfigDialog
          policy={selectedPolicy}
          open={showConfigDialog}
          onOpenChange={setShowConfigDialog}
        />
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Policy</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate{' '}
              <strong>{deleteTarget?.name}</strong>? Employees assigned to this
              policy will fall back to the default policy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id, {
                    onSuccess: () => {
                      setDeleteTarget(null);
                      if (selectedPolicyId === deleteTarget.id) {
                        setSelectedPolicyId(null);
                      }
                    },
                  });
                }
              }}
            >
              {deleteMutation.isPending ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
