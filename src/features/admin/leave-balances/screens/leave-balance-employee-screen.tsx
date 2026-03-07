'use client';

import { ArrowLeft, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getEmployeeBalances,
  getTransactions,
} from '@/services/leave-balances';

import type { LeaveBalance, LeaveTransaction } from '@/types/leave';

const TX_TYPE_LABELS: Record<string, string> = {
  allocation: 'Allocation',
  deduction: 'Deduction',
  carry_forward: 'Carry Forward',
  encashment: 'Encashment',
  reversal: 'Reversal',
  adjustment: 'Adjustment',
};

const TX_TYPE_VARIANTS: Record<
  string,
  'default' | 'success' | 'warning' | 'destructive' | 'secondary'
> = {
  allocation: 'success',
  deduction: 'destructive',
  carry_forward: 'default',
  encashment: 'warning',
  reversal: 'secondary',
  adjustment: 'warning',
};

interface LeaveBalanceEmployeeScreenProps {
  userId: string;
}

export function LeaveBalanceEmployeeScreen({
  userId,
}: LeaveBalanceEmployeeScreenProps) {
  const router = useRouter();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [transactions, setTransactions] = useState<LeaveTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [balRes, txRes] = await Promise.all([
        getEmployeeBalances(userId, year),
        getTransactions({ userId, year }),
      ]);
      setBalances(balRes.data);
      setTransactions(txRes.data);
    } catch {
      toast.error('Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  }, [userId, year]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const employeeName = balances[0]?.user
    ? `${balances[0].user.firstName} ${balances[0].user.lastName}`
    : userId;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/admin/leave-balances')}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{employeeName}</h1>
          <p className="text-muted-foreground text-sm">Leave balance details</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Year</Label>
          <Input
            type="number"
            className="w-24"
            value={year}
            onChange={e => setYear(parseInt(e.target.value, 10))}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Loading...
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {balances.map(b => (
              <Card key={b.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {b.leaveTypeConfig?.name ?? 'Unknown'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Number(b.balance)}</div>
                  <div className="text-muted-foreground mt-1 flex gap-3 text-xs">
                    <span>Alloc: {Number(b.allocated)}</span>
                    <span>Used: {Number(b.used)}</span>
                    {Number(b.adjusted) !== 0 && (
                      <span>Adj: {Number(b.adjusted)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No transactions found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                      <TableHead className="text-right">Prev Balance</TableHead>
                      <TableHead className="text-right">New Balance</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-xs">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              TX_TYPE_VARIANTS[tx.transactionType] ??
                              'secondary'
                            }
                          >
                            {TX_TYPE_LABELS[tx.transactionType] ??
                              tx.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(tx.days) > 0 ? '+' : ''}
                          {Number(tx.days)}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(tx.previousBalance)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {Number(tx.newBalance)}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate text-xs">
                          {tx.remarks ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
