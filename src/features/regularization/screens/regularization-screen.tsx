'use client';

import axios from 'axios';
import { Clock, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegularizationRequestsScreen } from '@/features/admin/regularization-requests/screens/regularization-requests-screen';
import {
  cancelRegularization,
  getMyRegularizations,
} from '@/services/regularizations';
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from '@/types/regularization';

import { CreateRegularizationDialog } from '../components/create-regularization-dialog';

import type {
  RegularizationRequest,
  RegularizationStatus,
} from '@/types/regularization';

const STATUS_VARIANTS: Record<
  string,
  'default' | 'success' | 'warning' | 'destructive' | 'secondary'
> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'secondary',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateString: string | null): string {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function RegularizationScreen() {
  const { data: session } = useSession();

  if (session?.user?.role === 'hr') {
    return <RegularizationRequestsScreen />;
  }

  return <EmployeeRegularizationView />;
}

function EmployeeRegularizationView() {
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [activeTab, setActiveTab] = useState<RegularizationStatus | 'all'>(
    'all'
  );

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const res = await getMyRegularizations({ status, page, limit });
      const data = res.data;
      setRequests(data?.requests ?? []);
      setTotal(data?.total ?? 0);
      setTotalPages(data?.totalPages ?? 1);
      if (data?.statusCounts) setStatusCounts(data.statusCounts);
    } catch {
      toast.error('Failed to load regularization requests');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, limit]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleCancel = async (id: string) => {
    try {
      await cancelRegularization(id);
      toast.success('Regularization request cancelled');
      void fetchRequests();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to cancel request')
        : 'Failed to cancel request';
      toast.error(
        typeof message === 'string' ? message : 'Failed to cancel request'
      );
    }
  };

  const tabs = [
    { value: 'all', label: 'All', count: statusCounts.all },
    { value: 'pending', label: 'Pending', count: statusCounts.pending },
    { value: 'approved', label: 'Approved', count: statusCounts.approved },
    { value: 'rejected', label: 'Rejected', count: statusCounts.rejected },
    { value: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance Regularization</h1>
          <p className="text-muted-foreground text-sm">
            Request corrections to your attendance records.
          </p>
        </div>
        <CreateRegularizationDialog onSuccess={() => void fetchRequests()} />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={v => {
          setActiveTab(v as RegularizationStatus | 'all');
          setPage(1);
        }}
      >
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-muted text-muted-foreground inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-5" />
                  {tab.label} Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="border-muted-foreground size-8 animate-spin rounded-full border-4 border-t-orange-500" />
                  </div>
                ) : requests.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No {tab.value === 'all' ? '' : tab.label.toLowerCase()}{' '}
                    regularization requests found.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Original Time</TableHead>
                        <TableHead>Requested Time</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map(req => (
                        <TableRow key={req.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(req.requestDate)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="whitespace-nowrap"
                            >
                              {REQUEST_TYPE_LABELS[req.requestType]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatTime(req.originalPunchIn)} -{' '}
                            {formatTime(req.originalPunchOut)}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {formatTime(req.requestedPunchIn)} -{' '}
                            {formatTime(req.requestedPunchOut)}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate text-sm">
                            {req.reason || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                STATUS_VARIANTS[req.status] ?? 'secondary'
                              }
                            >
                              {STATUS_LABELS[req.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {formatDate(req.createdAt)}
                          </TableCell>
                          <TableCell>
                            {req.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive h-7 gap-1 px-2 text-xs"
                                onClick={() => void handleCancel(req.id)}
                              >
                                <XCircle className="size-3.5" />
                                Cancel
                              </Button>
                            )}
                            {req.reviewNote && req.status !== 'pending' && (
                              <span
                                className="text-muted-foreground max-w-[120px] truncate text-[10px]"
                                title={req.reviewNote}
                              >
                                Note: {req.reviewNote}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {!isLoading && requests.length > 0 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
