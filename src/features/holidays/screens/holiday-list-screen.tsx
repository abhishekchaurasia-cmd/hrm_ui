'use client';

import axios from 'axios';
import { CalendarDays, Globe } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getMyHolidayPlan, getMyHolidays } from '@/services/holidays';

import type { Holiday, MyHolidayPlan } from '@/types/holiday';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function HolidayListScreen() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [plan, setPlan] = useState<MyHolidayPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (selectedYear: number) => {
    setIsLoading(true);
    try {
      const [holidaysRes, planRes] = await Promise.all([
        getMyHolidays(selectedYear),
        getMyHolidayPlan(),
      ]);
      setHolidays(holidaysRes.data ?? []);
      setPlan(planRes.data ?? null);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.message)
        : 'Failed to load holidays';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(year);
  }, [year, fetchData]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Holidays</h1>
          <p className="text-muted-foreground text-sm">
            {plan
              ? `${plan.name} · ${holidays.length} holiday${holidays.length !== 1 ? 's' : ''}`
              : 'View your assigned holidays'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map(y => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href="/my/holidays/calendar">
              <CalendarDays className="size-3.5" />
              Calendar View
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              Loading holidays...
            </p>
          ) : !plan ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Globe className="text-muted-foreground mb-4 size-12" />
              <p className="text-muted-foreground text-sm">
                No holiday plan assigned. Contact HR for assistance.
              </p>
            </div>
          ) : holidays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <CalendarDays className="text-muted-foreground mb-4 size-12" />
              <p className="text-muted-foreground text-sm">
                No holidays found for {year}.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Holiday Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Optional</TableHead>
                    <TableHead>Special</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(holiday => {
                      const dayName = new Date(
                        holiday.date + 'T00:00:00'
                      ).toLocaleDateString('en-IN', { weekday: 'long' });
                      return (
                        <TableRow key={holiday.id}>
                          <TableCell className="font-medium">
                            {holiday.name}
                          </TableCell>
                          <TableCell>{formatDate(holiday.date)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {dayName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                holiday.isOptional ? 'warning' : 'secondary'
                              }
                            >
                              {holiday.isOptional ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                holiday.isSpecial ? 'warning' : 'secondary'
                              }
                            >
                              {holiday.isSpecial ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              <p className="text-muted-foreground border-t px-4 py-3 text-sm">
                Showing {holidays.length} holiday
                {holidays.length !== 1 ? 's' : ''}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
