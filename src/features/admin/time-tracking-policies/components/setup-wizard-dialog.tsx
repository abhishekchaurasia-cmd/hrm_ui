'use client';

import {
  ArrowLeft,
  Fingerprint,
  Globe,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { useState } from 'react';

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
import { Label } from '@/components/ui/label';

import { useCreateTimeTrackingPolicy } from '../hooks/use-time-tracking-policies';

import type { CaptureSettings } from '@/types/time-tracking-policy';

type Step = 'biometric' | 'capture' | 'remote';

interface SetupWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (policyId: string) => void;
}

export function SetupWizardDialog({
  open,
  onOpenChange,
  onSuccess,
}: SetupWizardDialogProps) {
  const [step, setStep] = useState<Step>('biometric');
  const [name, setName] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [webEnabled, setWebEnabled] = useState(true);
  const [mobileEnabled, setMobileEnabled] = useState(false);
  const [remoteWork, setRemoteWork] = useState(false);

  const createMutation = useCreateTimeTrackingPolicy();

  const resetForm = () => {
    setStep('biometric');
    setName('');
    setBiometricEnabled(false);
    setWebEnabled(true);
    setMobileEnabled(false);
    setRemoteWork(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleSubmit = () => {
    const captureSettings: CaptureSettings = {
      biometricEnabled,
      webClockIn: {
        enabled: webEnabled,
        commentMandatory: false,
        ipRestrictionEnabled: false,
        allowedIPs: [],
      },
      remoteClockIn: {
        enabled: remoteWork,
        capturesLocation: true,
        ipRestrictionEnabled: false,
        allowedIPs: [],
      },
      mobileClockIn: {
        enabled: mobileEnabled,
      },
    };

    createMutation.mutate(
      {
        name,
        captureSettings,
        wfhAllowed: remoteWork,
      },
      {
        onSuccess: data => {
          handleClose();
          onSuccess?.(data.data.id);
        },
      }
    );
  };

  const stepIndex = step === 'biometric' ? 0 : step === 'capture' ? 1 : 2;

  return (
    <Dialog open={open} onOpenChange={val => !val && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step !== 'biometric' && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() =>
                  setStep(step === 'remote' ? 'capture' : 'biometric')
                }
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <DialogTitle>Get started with new attendance capture</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex justify-center gap-2 py-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1 w-16 rounded-full ${
                i <= stepIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 'biometric' && (
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="bg-muted/50 flex size-28 items-center justify-center rounded-full">
              <Fingerprint className="size-14 text-teal-700" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                Do you capture attendance via bio-metric devices?
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Attendance will be captured through bio-metric devices set at
                your location
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant={biometricEnabled ? 'default' : 'outline'}
                className="w-28"
                onClick={() => {
                  setBiometricEnabled(true);
                  setStep('capture');
                }}
              >
                Yes
              </Button>
              <Button
                variant={!biometricEnabled ? 'default' : 'outline'}
                className="w-28"
                onClick={() => {
                  setBiometricEnabled(false);
                  setStep('capture');
                }}
              >
                No
              </Button>
            </div>
          </div>
        )}

        {step === 'capture' && (
          <div className="flex flex-col items-center gap-6 py-6">
            <h3 className="text-lg font-semibold">
              How do you capture attendance?
            </h3>
            <div className="flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={() => setWebEnabled(!webEnabled)}
                className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                  webEnabled
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Monitor className="size-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Web</div>
                  <div className="text-muted-foreground text-sm">
                    Useful when you have employees working in office location.
                  </div>
                </div>
                <div
                  className={`flex size-5 items-center justify-center rounded border-2 ${
                    webEnabled ? 'border-primary bg-primary' : 'border-border'
                  }`}
                >
                  {webEnabled && (
                    <svg
                      className="size-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMobileEnabled(!mobileEnabled)}
                className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                  mobileEnabled
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-pink-50">
                  <Smartphone className="size-7 text-pink-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Mobile</div>
                  <div className="text-muted-foreground text-sm">
                    Useful when you have field employees who&apos;s location
                    needs to be captured.
                  </div>
                </div>
                <div
                  className={`flex size-5 items-center justify-center rounded border-2 ${
                    mobileEnabled
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`}
                >
                  {mobileEnabled && (
                    <svg
                      className="size-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            </div>
            <Button
              onClick={() => setStep('remote')}
              disabled={!webEnabled && !mobileEnabled}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'remote' && (
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="flex size-28 items-center justify-center rounded-full bg-emerald-50">
              <Globe className="size-14 text-emerald-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                Do your employees work remotely?
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Remote work is when an employee works from places like home,
                location, etc. instead of office.
              </p>
            </div>

            <div className="w-full">
              <Label>Policy Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Work from Office"
                className="mt-1"
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant={remoteWork ? 'default' : 'outline'}
                className="w-28"
                onClick={() => setRemoteWork(true)}
              >
                Yes
              </Button>
              <Button
                variant={!remoteWork ? 'default' : 'outline'}
                className="w-28"
                onClick={() => setRemoteWork(false)}
              >
                No
              </Button>
            </div>
          </div>
        )}

        {step === 'remote' && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Policy'}
            </Button>
          </DialogFooter>
        )}

        {step === 'biometric' && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
