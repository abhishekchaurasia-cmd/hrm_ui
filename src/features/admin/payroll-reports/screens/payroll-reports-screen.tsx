'use client';

import { Download, FileSpreadsheet, Lock, Plus, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  generatePayrollReport,
  getPayrollReports,
  finalizePayrollReport,
  getPayrollExportCsvUrl,
  type PayrollReport,
} from '@/services/payroll-reports';

export default function PayrollReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<PayrollReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const now = new Date();
  const [genMonth, setGenMonth] = useState(now.getMonth() + 1);
  const [genYear, setGenYear] = useState(now.getFullYear());

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPayrollReports();
      setReports(res.data);
    } catch {
      toast.error('Failed to load payroll reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await generatePayrollReport(genMonth, genYear);
      toast.success(`Payroll report generated for ${genMonth}/${genYear}`);
      await fetchReports();
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleFinalize = async (id: string) => {
    try {
      await finalizePayrollReport(id);
      toast.success('Report finalized');
      await fetchReports();
    } catch {
      toast.error('Failed to finalize report');
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage monthly payroll reports
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Month</label>
              <select
                className="rounded-md border px-3 py-2 text-sm"
                value={genMonth}
                onChange={e => setGenMonth(Number(e.target.value))}
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Year</label>
              <input
                type="number"
                className="w-24 rounded-md border px-3 py-2 text-sm"
                value={genYear}
                onChange={e => setGenYear(Number(e.target.value))}
                min={2020}
                max={2100}
              />
            </div>
            <Button onClick={handleGenerate} disabled={generating}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground py-8 text-center">Loading...</p>
          ) : reports.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No payroll reports generated yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Working Days</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {monthNames[report.month - 1]} {report.year}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.status === 'finalized'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.totalEmployees}</TableCell>
                    <TableCell>{report.totalWorkingDays}</TableCell>
                    <TableCell>
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/admin/payroll-reports/${report.id}`
                            )
                          }
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={getPayrollExportCsvUrl(report.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-1 h-3.5 w-3.5" />
                            CSV
                          </a>
                        </Button>
                        {report.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFinalize(report.id)}
                          >
                            <Lock className="mr-1 h-3.5 w-3.5" />
                            Finalize
                          </Button>
                        )}
                      </div>
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
