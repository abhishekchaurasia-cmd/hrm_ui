'use client';

import { useParams } from 'next/navigation';

import { LeaveBalanceEmployeeScreen } from '@/features/admin/leave-balances';

export default function EmployeeBalancePage() {
  const params = useParams<{ userId: string }>();
  return <LeaveBalanceEmployeeScreen userId={params.userId} />;
}
