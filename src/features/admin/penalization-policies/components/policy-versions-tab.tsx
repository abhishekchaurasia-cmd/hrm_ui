'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { usePolicyVersions } from '../hooks/use-penalization-policies';

interface PolicyVersionsTabProps {
  policyId: string;
}

export function PolicyVersionsTab({ policyId }: PolicyVersionsTabProps) {
  const { data, isLoading } = usePolicyVersions(policyId);
  const versions = data?.data ?? [];

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading versions...</p>;
  }

  if (versions.length === 0) {
    return <p className="text-muted-foreground text-sm">No versions found.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Effective From</TableHead>
            <TableHead>Deduction Method</TableHead>
            <TableHead>Buffer Period</TableHead>
            <TableHead>Rules</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map(version => (
            <TableRow key={version.id}>
              <TableCell className="font-medium">
                v{version.versionNumber}
              </TableCell>
              <TableCell>
                {new Date(version.effectiveFrom).toLocaleDateString()}
              </TableCell>
              <TableCell className="capitalize">
                {version.deductionMethod.replace(/_/g, ' ')}
              </TableCell>
              <TableCell>{version.bufferPeriodDays} day(s)</TableCell>
              <TableCell>
                {version.rules?.filter(r => r.isEnabled).length ?? 0} active
              </TableCell>
              <TableCell>
                <Badge variant={version.isActive ? 'success' : 'secondary'}>
                  {version.isActive ? 'Current' : 'Archived'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
