'use client';

import { ChevronDown, Search, X } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { useEffect, useRef, useState } from 'react';

import { getRelationOptions } from '@/features/admin/employee-profile/api/employee-profile';
import { cn } from '@/lib/utils';

interface EmployeeOption {
  value: string;
  label: string;
}

interface EmployeeSelectProps {
  value: string;
  onValueChange: (userId: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
}

export function EmployeeSelect({
  value,
  onValueChange,
  placeholder = 'Select employee...',
  allowClear = false,
  className,
}: EmployeeSelectProps) {
  const [options, setOptions] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    getRelationOptions('/api/v1/users/options')
      .then(data => {
        if (!cancelled) setOptions(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label;

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (userId: string) => {
    onValueChange(userId);
    setSearch('');
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
    setSearch('');
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            'border-input ring-offset-background focus:ring-ring flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            !selectedLabel && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">{selectedLabel ?? placeholder}</span>
          <span className="flex items-center gap-1">
            {allowClear && value && (
              <X
                className="text-muted-foreground hover:text-foreground size-3.5 cursor-pointer"
                onClick={handleClear}
              />
            )}
            <ChevronDown className="size-4 opacity-50" />
          </span>
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="bg-popover text-popover-foreground z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border shadow-md"
          sideOffset={4}
          align="start"
          onOpenAutoFocus={e => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="border-b p-2">
            <div className="flex items-center gap-2 px-1">
              <Search className="text-muted-foreground size-3.5 shrink-0" />
              <input
                ref={inputRef}
                className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {isLoading ? (
              <p className="text-muted-foreground py-4 text-center text-xs">
                Loading employees...
              </p>
            ) : error ? (
              <p className="text-destructive py-4 text-center text-xs">
                Failed to load employees.
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-xs">
                No employees found.
              </p>
            ) : (
              filtered.map(option => (
                <button
                  type="button"
                  key={option.value}
                  className={cn(
                    'hover:bg-accent hover:text-accent-foreground flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-left text-sm select-none',
                    value === option.value && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
