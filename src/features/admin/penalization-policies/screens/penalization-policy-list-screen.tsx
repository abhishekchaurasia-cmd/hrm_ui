'use client';

import { Plus, Search, ShieldAlert, Trash2 } from 'lucide-react';
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

import { PolicyEmployeesTab } from '../components/policy-employees-tab';
import { PolicySummaryTab } from '../components/policy-summary-tab';
import { PolicyVersionsTab } from '../components/policy-versions-tab';
import { SetupPolicyDialog } from '../components/setup-policy-dialog';
import {
  useDeletePenalizationPolicy,
  usePenalizationPolicies,
} from '../hooks/use-penalization-policies';

import type { PenalizationPolicy } from '@/types/penalization';

export function PenalizationPolicyListScreen() {
  const { data, isLoading } = usePenalizationPolicies();
  const deleteMutation = useDeletePenalizationPolicy();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PenalizationPolicy | null>(
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
          <h1 className="text-2xl font-bold">Penalization Policies</h1>
          <p className="text-muted-foreground text-sm">
            Configure attendance penalization rules for your organization.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-1 size-4" />
          New Policy
        </Button>
      </div>

      <div className="flex gap-5">
        {/* Left Sidebar - Policy List */}
        <div className="w-80 shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Policies</CardTitle>
              <div className="relative mt-2">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                <Input
                  placeholder="Search policies..."
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
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="size-4 shrink-0" />
                      <div>
                        <div className="font-medium">{policy.name}</div>
                        {policy.currentVersion && (
                          <div className="text-muted-foreground text-xs">
                            v{policy.currentVersion.versionNumber} &middot;{' '}
                            {policy.currentVersion.effectiveFrom}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={policy.isActive ? 'success' : 'secondary'}
                      className="ml-2 shrink-0"
                    >
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Policy Detail */}
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
              </CardHeader>
              <CardContent>
                {selectedPolicy.currentVersion ? (
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="employees">Employees</TabsTrigger>
                      <TabsTrigger value="versions">Versions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="mt-4">
                      <PolicySummaryTab
                        version={selectedPolicy.currentVersion}
                      />
                    </TabsContent>
                    <TabsContent value="employees" className="mt-4">
                      <PolicyEmployeesTab policyId={selectedPolicy.id} />
                    </TabsContent>
                    <TabsContent value="versions" className="mt-4">
                      <PolicyVersionsTab policyId={selectedPolicy.id} />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No version configured for this policy.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShieldAlert className="text-muted-foreground mb-4 size-12" />
                <h3 className="text-lg font-medium">
                  Select a policy to view details
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Choose a penalization policy from the list or create a new
                  one.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <SetupPolicyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {}}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Policy</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate{' '}
              <strong>{deleteTarget?.name}</strong>? This will stop applying
              penalties under this policy.
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
