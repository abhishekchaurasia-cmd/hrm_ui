'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Step {
  label: string;
}

const STEPS: Step[] = [
  { label: 'BASIC DETAILS' },
  { label: 'JOB DETAILS' },
  { label: 'WORK DETAILS' },
  { label: 'COMPENSATION' },
];

interface WizardStepperProps {
  currentStep: number;
}

export function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <nav aria-label="Wizard progress" className="flex items-center gap-8">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;

        return (
          <div key={step.label} className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isActive && 'bg-primary text-primary-foreground',
                  isCompleted && 'bg-primary text-primary-foreground',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="size-3.5" /> : stepNumber}
              </div>
              <span
                className={cn(
                  'text-xs font-medium tracking-wide',
                  isActive && 'text-foreground',
                  isCompleted && 'text-foreground',
                  !isActive && !isCompleted && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-10',
                  currentStep > index ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
