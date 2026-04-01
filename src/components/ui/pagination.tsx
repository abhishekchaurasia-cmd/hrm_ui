'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  className,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 px-1 py-3 sm:flex-row',
        className
      )}
    >
      <p className="text-muted-foreground text-sm">
        Showing{' '}
        <span className="text-foreground font-medium">
          {start}–{end}
        </span>{' '}
        of <span className="text-foreground font-medium">{total}</span>
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size"
            className="text-muted-foreground text-sm whitespace-nowrap"
          >
            Per page
          </label>
          <select
            id="page-size"
            value={limit}
            onChange={e => {
              onLimitChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="border-input bg-background text-foreground dark:bg-input/30 h-8 rounded-md border px-2 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="min-w-[4rem] text-center text-sm">
            {page} / {totalPages || 1}
          </span>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
