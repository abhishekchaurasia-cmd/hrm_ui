'use client';

import axios from 'axios';
import { CalendarDays, Globe, List } from 'lucide-react';
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
import { getHolidayCalendar, getMyHolidayPlan } from '@/services/holidays';

import type { Holiday, MyHolidayPlan } from '@/types/holiday';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

const MONTH_NAMES: Record<string, string> = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
};

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function getDayName(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
  });
}

function getMonthLabel(key: string): string {
  const month = key.split('-')[1];
  return MONTH_NAMES[month] ?? key;
}

export function HolidayCalendarScreen() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [months, setMonths] = useState<Record<string, Holiday[]>>({});
  const [totalHolidays, setTotalHolidays] = useState(0);
  const [plan, setPlan] = useState<MyHolidayPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (selectedYear: number) => {
    setIsLoading(true);
    try {
      const [calRes, planRes] = await Promise.all([
        getHolidayCalendar(selectedYear),
        getMyHolidayPlan(),
      ]);
      setMonths(calRes.data?.months ?? {});
      setTotalHolidays(calRes.data?.totalHolidays ?? 0);
      setPlan(planRes.data ?? null);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.message)
        : 'Failed to load calendar';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(year);
  }, [year, fetchData]);

  const sortedMonthKeys = Object.keys(months).sort();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Holiday Calendar {year}
          </h1>
          <p className="text-muted-foreground text-sm">
            {plan
              ? `${plan.name} · ${totalHolidays} day${totalHolidays !== 1 ? 's' : ''}`
              : 'View your holidays by month'}
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
            <Link href="/my/holidays">
              <List className="size-3.5" />
              List View
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-muted-foreground text-center text-sm">
              Loading calendar...
            </p>
          </CardContent>
        </Card>
      ) : !plan ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Globe className="text-muted-foreground mb-4 size-12" />
            <p className="text-muted-foreground text-sm">
              No holiday plan assigned. Contact HR for assistance.
            </p>
          </CardContent>
        </Card>
      ) : sortedMonthKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="text-muted-foreground mb-4 size-12" />
            <p className="text-muted-foreground text-sm">
              No holidays found for {year}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedMonthKeys.map(monthKey => {
            const monthHolidays = months[monthKey]
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date));
            return (
              <Card key={monthKey}>
                <CardContent className="p-0">
                  <div className="bg-muted/50 border-b px-4 py-2.5">
                    <h3 className="text-sm font-semibold">
                      {getMonthLabel(monthKey)}
                      <span className="text-muted-foreground ml-2 font-normal">
                        ({monthHolidays.length} holiday
                        {monthHolidays.length !== 1 ? 's' : ''})
                      </span>
                    </h3>
                  </div>
                  <div className="divide-y">
                    {monthHolidays.map(holiday => (
                      <div
                        key={holiday.id}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        <div className="text-muted-foreground w-20 shrink-0 text-sm">
                          {formatShortDate(holiday.date)}
                        </div>
                        <div className="text-muted-foreground w-12 shrink-0 text-xs">
                          {getDayName(holiday.date)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium">
                            {holiday.name}
                          </span>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          {holiday.isOptional && (
                            <Badge variant="warning" className="text-[10px]">
                              Optional
                            </Badge>
                          )}
                          {holiday.isSpecial && (
                            <Badge variant="secondary" className="text-[10px]">
                              Special
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
