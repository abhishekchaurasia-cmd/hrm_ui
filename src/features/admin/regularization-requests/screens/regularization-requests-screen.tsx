'use client';

import { CheckCircle2, Clock, XCircle } from 'lucide-react';
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
import { getHrRegularizations } from '@/services/regularizations';
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from '@/types/regularization';

import { ReviewRegularizationDialog } from '../components/review-regularization-dialog';

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

type ReviewAction = 'approve' | 'reject';

export function RegularizationRequestsScreen() {
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<RegularizationStatus | 'all'>(
    'pending'
  );

  const [reviewTarget, setReviewTarget] = useState<{
    request: RegularizationRequest;
    action: ReviewAction;
  } | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const res = await getHrRegularizations({ status, page, limit });
      const data = res.data;
      setRequests(data?.requests ?? []);
      setTotal(data?.total ?? 0);
      setTotalPages(data?.totalPages ?? 1);
      setPendingCount(data?.pendingCount ?? 0);
    } catch {
      toast.error('Failed to load regularization requests');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, limit]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Regularization Requests</h1>
        <p className="text-muted-foreground text-sm">
          Review and manage employee attendance regularization requests.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={v => {
          setActiveTab(v as RegularizationStatus | 'all');
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            Pending
            {pendingCount > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'rejected', 'all'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-5" />
                  {tab === 'all'
                    ? 'All Regularization Requests'
                    : `${tab.charAt(0).toUpperCase()}${tab.slice(1)} Requests`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="border-muted-foreground size-8 animate-spin rounded-full border-4 border-t-blue-500" />
                  </div>
                ) : requests.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No {tab === 'all' ? '' : tab} regularization requests found.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
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
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {req.user
                                  ? `${req.user.firstName} ${req.user.lastName}`
                                  : '-'}
                              </span>
                              {req.user?.email && (
                                <span className="text-muted-foreground text-xs">
                                  {req.user.email}
                                </span>
                              )}
                            </div>
                          </TableCell>
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
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 gap-1 px-2 text-xs text-green-500 hover:text-green-400"
                                  onClick={() =>
                                    setReviewTarget({
                                      request: req,
                                      action: 'approve',
                                    })
                                  }
                                >
                                  <CheckCircle2 className="size-3.5" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive h-7 gap-1 px-2 text-xs"
                                  onClick={() =>
                                    setReviewTarget({
                                      request: req,
                                      action: 'reject',
                                    })
                                  }
                                >
                                  <XCircle className="size-3.5" />
                                  Reject
                                </Button>
                              </div>
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

      <ReviewRegularizationDialog
        target={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSuccess={() => void fetchRequests()}
      />
    </div>
  );
}
