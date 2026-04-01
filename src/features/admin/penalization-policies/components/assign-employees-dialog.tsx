'use client';

import { useState } from 'react';

import { EmployeeMultiSelect } from '@/components/employee-multi-select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useAssignEmployees } from '../hooks/use-penalization-policies';

interface AssignEmployeesDialogProps {
  policyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignEmployeesDialog({
  policyId,
  open,
  onOpenChange,
}: AssignEmployeesDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const mutation = useAssignEmployees(policyId);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedUsers([]);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = () => {
    if (selectedUsers.length === 0) return;
    mutation.mutate(
      { userIds: selectedUsers },
      {
        onSuccess: () => {
          handleOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Employees</DialogTitle>
          <DialogDescription>
            Select employees to assign to this penalization policy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <EmployeeMultiSelect
            value={selectedUsers}
            onValueChange={setSelectedUsers}
            placeholder="Search and select employees..."
          />

          <p className="text-muted-foreground text-xs">
            {selectedUsers.length} employee(s) selected
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || mutation.isPending}
          >
            {mutation.isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
