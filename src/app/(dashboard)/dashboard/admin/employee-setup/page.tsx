'use client';

import { UserPlus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { OnboardingWizard } from '@/features/admin/employee-onboarding';

export default function EmployeeSetupPage() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employee Onboarding</h1>
          <p className="text-muted-foreground text-sm">
            Add new employees to your organisation
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <UserPlus className="mr-2 size-4" />
          Add Employee
        </Button>
      </div>

      <OnboardingWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
}
