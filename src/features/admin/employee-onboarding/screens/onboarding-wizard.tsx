'use client';

import axios from 'axios';
import { X } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { BasicDetailsForm } from '@/features/admin/employee-onboarding/components/basic-details-form';
import { CompensationForm } from '@/features/admin/employee-onboarding/components/compensation-form';
import { JobDetailsForm } from '@/features/admin/employee-onboarding/components/job-details-form';
import { WizardStepper } from '@/features/admin/employee-onboarding/components/wizard-stepper';
import { WorkDetailsForm } from '@/features/admin/employee-onboarding/components/work-details-form';
import { useOnboardEmployee } from '@/features/admin/employee-onboarding/hooks/use-onboard-employee';
import { buildOnboardingPayload } from '@/features/admin/employee-onboarding/schema/onboarding.schema';

import type {
  BasicDetailsFormValues,
  JobDetailsFormValues,
  WorkDetailsFormValues,
  CompensationFormValues,
} from '@/features/admin/employee-onboarding/schema/onboarding.schema';

interface StepFormHandle {
  submit: () => void;
}

interface WizardData {
  basicDetails?: BasicDetailsFormValues;
  jobDetails?: JobDetailsFormValues;
  workDetails?: WorkDetailsFormValues;
  compensation?: CompensationFormValues;
}

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const _STEP_KEYS = [
  'basicDetails',
  'jobDetails',
  'workDetails',
  'compensation',
] as const;

export function OnboardingWizard({
  open,
  onClose,
  onSuccess,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<WizardData>({});
  const formRef = useRef<StepFormHandle | null>(null);
  const { mutate, isPending } = useOnboardEmployee();

  const handleStepData = useCallback(
    (key: keyof WizardData, data: WizardData[keyof WizardData]) => {
      setFormData(prev => ({ ...prev, [key]: data }));
    },
    []
  );

  const goNext = useCallback(() => {
    formRef.current?.submit();
  }, []);

  const goBack = useCallback(() => {
    setStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleBasicDetailsSubmit = useCallback(
    (data: BasicDetailsFormValues) => {
      handleStepData('basicDetails', data);
      setStep(1);
    },
    [handleStepData]
  );

  const handleJobDetailsSubmit = useCallback(
    (data: JobDetailsFormValues) => {
      handleStepData('jobDetails', data);
      setStep(2);
    },
    [handleStepData]
  );

  const handleWorkDetailsSubmit = useCallback(
    (data: WorkDetailsFormValues) => {
      handleStepData('workDetails', data);
      setStep(3);
    },
    [handleStepData]
  );

  const handleCompensationSubmit = useCallback(
    (data: CompensationFormValues) => {
      const merged = { ...formData, compensation: data };

      if (!merged.basicDetails) {
        toast.error(
          'Basic details are required. Please go back and fill them.'
        );
        setStep(0);
        return;
      }

      const payload = buildOnboardingPayload({
        basicDetails: merged.basicDetails,
        jobDetails: merged.jobDetails,
        workDetails: merged.workDetails,
        compensation: merged.compensation,
      });

      mutate(payload, {
        onSuccess: response => {
          toast.success(response.message || 'Employee onboarded successfully');
          setStep(0);
          setFormData({});
          onSuccess?.();
          onClose();
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message;
            if (Array.isArray(message)) {
              message.forEach((msg: string) => toast.error(msg));
            } else {
              toast.error((message as string) || 'Failed to onboard employee');
            }
          } else {
            toast.error('Failed to onboard employee');
          }
        },
      });
    },
    [formData, mutate, onClose, onSuccess]
  );

  const handleClose = useCallback(() => {
    setStep(0);
    setFormData({});
    onClose();
  }, [onClose]);

  if (!open) return null;

  const isLastStep = step === 3;
  const isFirstStep = step === 0;

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Add Employee Wizard</h1>

        <div className="flex items-center gap-4">
          <WizardStepper currentStep={step} />
        </div>

        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <Button variant="outline" onClick={goBack} disabled={isPending}>
              Back
            </Button>
          )}
          {isFirstStep && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === 2 ? (
            <Button onClick={goNext} disabled={isPending}>
              Save &amp; Continue
            </Button>
          ) : isLastStep ? (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isPending}
              >
                Skip this Step
              </Button>
              <Button onClick={goNext} disabled={isPending}>
                {isPending ? 'Submitting...' : 'Finish'}
              </Button>
            </>
          ) : (
            <Button onClick={goNext} disabled={isPending}>
              Continue
            </Button>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground ml-2 p-1"
            aria-label="Close wizard"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-2xl">
          {step === 0 && (
            <BasicDetailsForm
              defaultValues={formData.basicDetails}
              onSubmit={handleBasicDetailsSubmit}
              formRef={formRef}
            />
          )}
          {step === 1 && (
            <JobDetailsForm
              defaultValues={formData.jobDetails}
              onSubmit={handleJobDetailsSubmit}
              formRef={formRef}
            />
          )}
          {step === 2 && (
            <WorkDetailsForm
              defaultValues={formData.workDetails}
              onSubmit={handleWorkDetailsSubmit}
              formRef={formRef}
            />
          )}
          {step === 3 && (
            <CompensationForm
              defaultValues={formData.compensation}
              onSubmit={handleCompensationSubmit}
              formRef={formRef}
            />
          )}
        </div>
      </main>
    </div>
  );
}
