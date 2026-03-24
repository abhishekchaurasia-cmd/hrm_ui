'use client';

import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getRelationOptions } from '@/features/admin/employee-profile/api/employee-profile';
import { cn } from '@/lib/utils';

import { Badge } from './ui/badge';

interface EmployeeOption {
  value: string;
  label: string;
}

interface EmployeeMultiSelectProps {
  value: string[];
  onValueChange: (userIds: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function EmployeeMultiSelect({
  value,
  onValueChange,
  placeholder = 'Select employees...',
  className,
}: EmployeeMultiSelectProps) {
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

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(
    () =>
      options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every(o => selectedSet.has(o.value));

  const handleToggle = (userId: string) => {
    if (selectedSet.has(userId)) {
      onValueChange(value.filter(id => id !== userId));
    } else {
      onValueChange([...value, userId]);
    }
  };

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filtered.map(o => o.value));
      onValueChange(value.filter(id => !filteredIds.has(id)));
    } else {
      const merged = new Set(value);
      filtered.forEach(o => merged.add(o.value));
      onValueChange(Array.from(merged));
    }
  };

  const handleRemove = (userId: string) => {
    onValueChange(value.filter(id => id !== userId));
  };

  const labelMap = useMemo(() => {
    const map = new Map<string, string>();
    options.forEach(o => map.set(o.value, o.label));
    return map;
  }, [options]);

  const triggerLabel =
    value.length === 0
      ? placeholder
      : `${value.length} employee${value.length > 1 ? 's' : ''} selected`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            className={cn(
              'border-input ring-offset-background focus:ring-ring flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              value.length === 0 && 'text-muted-foreground'
            )}
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="size-4 shrink-0 opacity-50" />
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

            {!isLoading && !error && filtered.length > 0 && (
              <div className="border-b px-2 py-1.5">
                <button
                  type="button"
                  className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1 text-sm select-none"
                  onClick={handleSelectAll}
                >
                  <div
                    className={cn(
                      'border-primary flex size-4 shrink-0 items-center justify-center rounded-sm border',
                      allFilteredSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50'
                    )}
                  >
                    {allFilteredSelected && <Check className="size-3" />}
                  </div>
                  <span className="font-medium">
                    {allFilteredSelected ? 'Deselect All' : 'Select All'}
                  </span>
                  <span className="text-muted-foreground ml-auto text-xs">
                    {filtered.length}
                  </span>
                </button>
              </div>
            )}

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
                filtered.map(option => {
                  const isSelected = selectedSet.has(option.value);
                  return (
                    <button
                      type="button"
                      key={option.value}
                      className={cn(
                        'hover:bg-accent hover:text-accent-foreground flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm select-none',
                        isSelected && 'bg-accent/50'
                      )}
                      onClick={() => handleToggle(option.value)}
                    >
                      <div
                        className={cn(
                          'border-primary flex size-4 shrink-0 items-center justify-center rounded-sm border',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50'
                        )}
                      >
                        {isSelected && <Check className="size-3" />}
                      </div>
                      {option.label}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(id => (
            <Badge key={id} variant="secondary" className="gap-1 pr-1">
              <span className="max-w-[150px] truncate">
                {labelMap.get(id) ?? id.slice(0, 8)}
              </span>
              <button
                type="button"
                className="hover:bg-muted rounded-sm p-0.5"
                onClick={() => handleRemove(id)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
