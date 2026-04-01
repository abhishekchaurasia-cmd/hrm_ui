import PayrollReportDetailScreen from '@/features/admin/payroll-reports/screens/payroll-report-detail-screen';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PayrollReportDetailPage({ params }: Props) {
  const { id } = await params;
  return <PayrollReportDetailScreen reportId={id} />;
}
