'use client';

import axios from 'axios';
import { Clock, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  createRegularization,
  getMyRemainingEntries,
} from '@/services/regularizations';
import { REQUEST_TYPE_LABELS } from '@/types/regularization';

import type {
  RegularizationRequestType,
  RemainingEntriesInfo,
} from '@/types/regularization';

interface CreateRegularizationDialogProps {
  onSuccess: () => void;
  prefillDate?: string;
  autoOpen?: boolean;
}

const REQUEST_TYPES: RegularizationRequestType[] = [
  'missed_punch_in',
  'missed_punch_out',
  'incorrect_time',
  'forgot_to_punch',
  'other',
];

export function CreateRegularizationDialog({
  onSuccess,
  prefillDate,
  autoOpen = false,
}: CreateRegularizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [didAutoOpen, setDidAutoOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remaining, setRemaining] = useState<RemainingEntriesInfo | null>(null);

  const [requestDate, setRequestDate] = useState(prefillDate ?? '');
  const [requestType, setRequestType] =
    useState<RegularizationRequestType>('forgot_to_punch');
  const [requestedPunchIn, setRequestedPunchIn] = useState('');
  const [requestedPunchOut, setRequestedPunchOut] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    void getMyRemainingEntries().then(res => {
      if (res.data) setRemaining(res.data);
    });
  }, []);

  useEffect(() => {
    if (open) {
      void getMyRemainingEntries().then(res => {
        if (res.data) setRemaining(res.data);
      });
    }
  }, [open]);

  useEffect(() => {
    if (prefillDate) setRequestDate(prefillDate);
  }, [prefillDate]);

  useEffect(() => {
    if (autoOpen && !didAutoOpen) {
      setOpen(true);
      setDidAutoOpen(true);
    }
  }, [autoOpen, didAutoOpen]);

  const resetForm = () => {
    setRequestDate(prefillDate ?? '');
    setRequestType('forgot_to_punch');
    setRequestedPunchIn('');
    setRequestedPunchOut('');
    setReason('');
  };

  const handleSubmit = async () => {
    if (!requestDate) {
      toast.error('Please select a date');
      return;
    }
    if (!requestedPunchIn || !requestedPunchOut) {
      toast.error('Please enter both punch-in and punch-out times');
      return;
    }

    const punchInISO = `${requestDate}T${requestedPunchIn}:00.000Z`;
    const punchOutISO = `${requestDate}T${requestedPunchOut}:00.000Z`;

    if (punchOutISO <= punchInISO) {
      toast.error('Punch-out must be after punch-in');
      return;
    }

    if (remaining?.reasonRequired && !reason.trim()) {
      toast.error('Reason is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRegularization({
        requestDate,
        requestedPunchIn: punchInISO,
        requestedPunchOut: punchOutISO,
        requestType,
        reason: reason.trim() || undefined,
      });
      toast.success('Regularization request submitted');
      const freshRes = await getMyRemainingEntries();
      if (freshRes.data) setRemaining(freshRes.data);
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to submit request')
        : 'Failed to submit request';
      toast.error(
        typeof message === 'string' ? message : 'Failed to submit request'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() - 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() - (remaining?.pastDaysLimit ?? 30));
  const minDateStr = minDate.toISOString().split('T')[0];

  const canSubmit = remaining?.enabled && (remaining?.remaining ?? 0) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={val => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="size-4" />
          Request Regularization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Request Attendance Regularization
          </DialogTitle>
          <DialogDescription>
            Submit a request to correct your attendance for a past date.
          </DialogDescription>
        </DialogHeader>

        {remaining && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Remaining entries:</span>
            {remaining.enabled ? (
              <Badge
                variant={remaining.remaining > 0 ? 'success' : 'destructive'}
              >
                {remaining.remaining} / {remaining.total} per {remaining.period}
              </Badge>
            ) : (
              <Badge variant="secondary">Not enabled</Badge>
            )}
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="reg-date">Date to Regularize</Label>
            <Input
              id="reg-date"
              type="date"
              value={requestDate}
              onChange={e => setRequestDate(e.target.value)}
              min={minDateStr}
              max={maxDateStr}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reg-type">Request Type</Label>
            <Select
              value={requestType}
              onValueChange={v =>
                setRequestType(v as RegularizationRequestType)
              }
            >
              <SelectTrigger id="reg-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {REQUEST_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="reg-punch-in">Punch In Time</Label>
              <Input
                id="reg-punch-in"
                type="time"
                value={requestedPunchIn}
                onChange={e => setRequestedPunchIn(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reg-punch-out">Punch Out Time</Label>
              <Input
                id="reg-punch-out"
                type="time"
                value={requestedPunchOut}
                onChange={e => setRequestedPunchOut(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reg-reason">
              Reason{remaining?.reasonRequired ? ' *' : ''}
            </Label>
            <Textarea
              id="reg-reason"
              placeholder="Explain why you need to regularize this attendance..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
