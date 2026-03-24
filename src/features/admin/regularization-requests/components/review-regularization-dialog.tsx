'use client';

import axios from 'axios';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { Textarea } from '@/components/ui/textarea';
import {
  approveRegularization,
  rejectRegularization,
} from '@/services/regularizations';
import { REQUEST_TYPE_LABELS } from '@/types/regularization';

import type { RegularizationRequest } from '@/types/regularization';

type ReviewAction = 'approve' | 'reject';

interface ReviewRegularizationDialogProps {
  target: { request: RegularizationRequest; action: ReviewAction } | null;
  onClose: () => void;
  onSuccess: () => void;
}

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

export function ReviewRegularizationDialog({
  target,
  onClose,
  onSuccess,
}: ReviewRegularizationDialogProps) {
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async () => {
    if (!target) return;
    setIsSubmitting(true);
    try {
      const fn =
        target.action === 'approve'
          ? approveRegularization
          : rejectRegularization;
      await fn(target.request.id, reviewNote || undefined);
      toast.success(
        `Regularization request ${target.action === 'approve' ? 'approved' : 'rejected'}`
      );
      onClose();
      setReviewNote('');
      onSuccess();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Action failed')
        : 'Action failed';
      toast.error(typeof message === 'string' ? message : 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={!!target}
      onOpenChange={open => {
        if (!open) {
          onClose();
          setReviewNote('');
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {target?.action === 'approve' ? (
              <CheckCircle2 className="size-5 text-green-500" />
            ) : (
              <XCircle className="size-5 text-red-500" />
            )}
            {target?.action === 'approve'
              ? 'Approve Regularization'
              : 'Reject Regularization'}
          </DialogTitle>
          <DialogDescription>
            {target?.request.user &&
              `${target.request.user.firstName} ${target.request.user.lastName}`}
            {' — '}
            {target && formatDate(target.request.requestDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border p-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Request Type
                </p>
                <Badge variant="outline" className="mt-1">
                  {target && REQUEST_TYPE_LABELS[target.request.requestType]}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Date
                </p>
                <p className="mt-1 font-medium">
                  {target && formatDate(target.request.requestDate)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Original Time
                </p>
                <p className="mt-1">
                  {target && formatTime(target.request.originalPunchIn)} -{' '}
                  {target && formatTime(target.request.originalPunchOut)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Requested Time
                </p>
                <p className="mt-1 font-medium">
                  <Clock className="mr-1 inline size-3" />
                  {target && formatTime(target.request.requestedPunchIn)} -{' '}
                  {target && formatTime(target.request.requestedPunchOut)}
                </p>
              </div>
            </div>
            {target?.request.reason && (
              <div className="mt-3 border-t pt-3">
                <p className="text-muted-foreground text-xs font-medium">
                  Reason
                </p>
                <p className="mt-1">{target.request.reason}</p>
              </div>
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
              onClose();
              setReviewNote('');
            }}
          >
            Cancel
          </Button>
          <Button
            className={
              target?.action === 'approve'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }
            onClick={() => void handleReview()}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : target?.action === 'approve'
                ? 'Confirm Approve'
                : 'Confirm Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
