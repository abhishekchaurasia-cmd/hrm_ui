'use client';

import { ArrowLeft, Search, FileText } from 'lucide-react';
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
import { getTransactions } from '@/services/leave-balances';

import type { LeaveTransaction } from '@/types/leave';

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

export function LeaveTransactionScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<LeaveTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterYear, setFilterYear] = useState(
    String(new Date().getFullYear())
  );
  const [filterUserId, setFilterUserId] = useState('');

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { userId?: string; year?: number } = {};
      if (filterYear) params.year = parseInt(filterYear, 10);
      if (filterUserId) params.userId = filterUserId;
      const res = await getTransactions(params);
      setTransactions(res.data);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [filterYear, filterUserId]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

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
        <div>
          <h1 className="text-2xl font-semibold">Transaction Audit Log</h1>
          <p className="text-muted-foreground text-sm">
            Full history of leave balance changes
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Year</Label>
              <Input
                type="number"
                className="w-28"
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Employee ID</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Filter by employee UUID"
                  className="w-72"
                  value={filterUserId}
                  onChange={e => setFilterUserId(e.target.value)}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={fetchTransactions}
                >
                  <Search className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading transactions...
            </p>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No transactions found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
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
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">{tx.userId}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          TX_TYPE_VARIANTS[tx.transactionType] ?? 'secondary'
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
    </div>
  );
}
