'use client';

import { ChevronDown, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
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
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  // Native pointerdown listener on the portal div so that Radix Dialog's
  // DismissableLayer (which listens on document in the bubble phase) never
  // sees pointer events originating inside the dropdown. React's synthetic
  // onPointerDown does NOT add a native listener on the element — it uses
  // event delegation at the root — so we must do this natively.
  useEffect(() => {
    const el = dropdownRef.current;
    if (!el || !open) return;

    const stop = (e: PointerEvent) => {
      e.stopPropagation();
    };
    el.addEventListener('pointerdown', stop);
    return () => el.removeEventListener('pointerdown', stop);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: PointerEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener('pointerdown', handleClickOutside);
    return () =>
      document.removeEventListener('pointerdown', handleClickOutside);
  }, [open]);

  const selectedLabel = options.find(o => o.value === value)?.label;

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = () => {
    setOpen(prev => {
      if (!prev) {
        updatePosition();
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      return !prev;
    });
  };

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
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'border-input ring-offset-background focus:ring-ring flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          !selectedLabel && 'text-muted-foreground'
        )}
        onClick={handleToggle}
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

      {open &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            className="bg-popover text-popover-foreground overflow-hidden rounded-md border shadow-md"
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 9999,
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
                      value === option.value &&
                        'bg-accent text-accent-foreground'
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
