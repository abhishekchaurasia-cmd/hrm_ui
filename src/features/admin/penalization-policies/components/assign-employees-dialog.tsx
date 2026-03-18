'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { EmployeeSelect } from '@/components/employee-select';
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
  const [currentSelection, setCurrentSelection] = useState('');
  const mutation = useAssignEmployees(policyId);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedUsers([]);
      setCurrentSelection('');
    }
    onOpenChange(nextOpen);
  };

  const handleAddUser = (userId: string) => {
    if (userId && !selectedUsers.includes(userId)) {
      setSelectedUsers(prev => [...prev, userId]);
    }
    setCurrentSelection('');
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
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
          <EmployeeSelect
            value={currentSelection}
            onValueChange={handleAddUser}
            placeholder="Search and add employees..."
          />

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(userId => (
                <Badge key={userId} variant="secondary" className="gap-1">
                  {userId.slice(0, 8)}...
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(userId)}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

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
