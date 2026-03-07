import { Calendar, ChevronRight, Download, Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  date?: string;
}

export function PageHeader({ title, breadcrumbs, date }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between lg:items-center">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1 text-sm">
          <Link href="/dashboard" className="hover:text-foreground">
            <Home className="size-3.5" />
          </Link>
          {breadcrumbs.map(crumb => (
            <span key={crumb.label} className="flex items-center gap-1">
              <ChevronRight className="size-3" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="size-3.5" />
          Export
        </Button>
        {date && (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Calendar className="size-3.5" />
            {date}
          </Button>
        )}
      </div>
    </div>
  );
}
