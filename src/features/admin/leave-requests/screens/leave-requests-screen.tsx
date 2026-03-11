'use client';

import axios from 'axios';
import { CheckCircle2, FileText, XCircle } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  approveLeaveRequest,
  getHrLeaves,
  rejectLeaveRequest,
} from '@/services/leaves';

import type { LeaveRequest, LeaveRequestStatus } from '@/types/leave';

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

type ReviewAction = 'approve' | 'reject';

export function LeaveRequestsScreen() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LeaveRequestStatus | 'all'>(
    'pending'
  );

  const [reviewTarget, setReviewTarget] = useState<{
    leave: LeaveRequest;
    action: ReviewAction;
  } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const res = await getHrLeaves({ status });
      setLeaves(res.data?.leaves ?? []);
    } catch {
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void fetchLeaves();
  }, [fetchLeaves]);

  const handleReview = async () => {
    if (!reviewTarget) return;
    setIsSubmitting(true);
    try {
      const fn =
        reviewTarget.action === 'approve'
          ? approveLeaveRequest
          : rejectLeaveRequest;
      await fn(reviewTarget.leave.id, reviewNote || undefined);
      toast.success(
        `Leave request ${reviewTarget.action === 'approve' ? 'approved' : 'rejected'}`
      );
      setReviewTarget(null);
      setReviewNote('');
      void fetchLeaves();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Action failed')
        : 'Action failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = leaves.length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Leave Requests</h1>
        <p className="text-muted-foreground text-sm">
          Review and manage employee leave requests.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={v => setActiveTab(v as LeaveRequestStatus | 'all')}
      >
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            Pending
            {activeTab === 'pending' && pendingCount > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
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
                  <FileText className="size-5" />
                  {tab === 'all'
                    ? 'All Leave Requests'
                    : `${tab.charAt(0).toUpperCase()}${tab.slice(1)} Requests`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="border-muted-foreground size-8 animate-spin rounded-full border-4 border-t-orange-500" />
                  </div>
                ) : leaves.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No {tab === 'all' ? '' : tab} leave requests found.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves.map(l => (
                        <TableRow key={l.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {l.user
                                  ? `${l.user.firstName} ${l.user.lastName}`
                                  : '-'}
                              </span>
                              {l.user?.email && (
                                <span className="text-muted-foreground text-xs">
                                  {l.user.email}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              {l.leaveTypeConfig ? (
                                <Badge variant="outline" className="w-fit">
                                  {l.leaveTypeConfig.name}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  {l.leaveType ?? '-'}
                                </span>
                              )}
                              {l.isHalfDay && (
                                <span className="text-muted-foreground text-[10px]">
                                  {l.halfDayType === 'first_half'
                                    ? 'First Half'
                                    : 'Second Half'}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {formatDate(l.startDate)}
                            {l.startDate !== l.endDate &&
                              ` — ${formatDate(l.endDate)}`}
                          </TableCell>
                          <TableCell className="font-medium">
                            {l.numberOfDays}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate text-sm">
                            {l.reason || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={STATUS_VARIANTS[l.status] ?? 'secondary'}
                            >
                              {l.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {formatDate(l.createdAt)}
                          </TableCell>
                          <TableCell>
                            {l.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 gap-1 px-2 text-xs text-green-500 hover:text-green-400"
                                  onClick={() =>
                                    setReviewTarget({
                                      leave: l,
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
                                      leave: l,
                                      action: 'reject',
                                    })
                                  }
                                >
                                  <XCircle className="size-3.5" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {l.reviewNote && l.status !== 'pending' && (
                              <span
                                className="text-muted-foreground max-w-[120px] truncate text-[10px]"
                                title={l.reviewNote}
                              >
                                Note: {l.reviewNote}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Review Dialog */}
      <Dialog
        open={!!reviewTarget}
        onOpenChange={open => {
          if (!open) {
            setReviewTarget(null);
            setReviewNote('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewTarget?.action === 'approve' ? (
                <CheckCircle2 className="size-5 text-green-500" />
              ) : (
                <XCircle className="size-5 text-red-500" />
              )}
              {reviewTarget?.action === 'approve'
                ? 'Approve Leave'
                : 'Reject Leave'}
            </DialogTitle>
            <DialogDescription>
              {reviewTarget?.leave.user &&
                `${reviewTarget.leave.user.firstName} ${reviewTarget.leave.user.lastName} — `}
              {reviewTarget?.leave.leaveTypeConfig?.name ??
                reviewTarget?.leave.leaveType}{' '}
              ({reviewTarget?.leave.numberOfDays} day
              {(reviewTarget?.leave.numberOfDays ?? 0) > 1 ? 's' : ''})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-muted-foreground rounded-lg border p-3 text-sm">
              <p>
                <span className="font-medium text-neutral-300">Period:</span>{' '}
                {reviewTarget && formatDate(reviewTarget.leave.startDate)}
                {reviewTarget &&
                  reviewTarget.leave.startDate !== reviewTarget.leave.endDate &&
                  ` — ${formatDate(reviewTarget.leave.endDate)}`}
              </p>
              {reviewTarget?.leave.reason && (
                <p className="mt-1">
                  <span className="font-medium text-neutral-300">Reason:</span>{' '}
                  {reviewTarget.leave.reason}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Review Note (optional)
              </label>
              <Textarea
                placeholder="Add a note for the employee..."
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewTarget(null);
                setReviewNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              className={
                reviewTarget?.action === 'approve'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }
              onClick={() => void handleReview()}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : reviewTarget?.action === 'approve'
                  ? 'Confirm Approve'
                  : 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
