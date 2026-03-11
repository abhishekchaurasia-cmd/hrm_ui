'use client';

import { useParams } from 'next/navigation';

import { EmployeeProfilePage } from '@/features/admin/employee-profile';

export default function AdminEmployeeProfileRoute() {
  const params = useParams<{ userId: string }>();

  return <EmployeeProfilePage userId={params.userId} />;
}
