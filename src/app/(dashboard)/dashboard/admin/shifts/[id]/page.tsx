'use client';

import { useParams } from 'next/navigation';

import { ShiftDetailScreen } from '@/features/admin/shifts';

export default function ShiftDetailPage() {
  const params = useParams<{ id: string }>();
  return <ShiftDetailScreen shiftId={params.id} />;
}
