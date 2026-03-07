import { AttendanceInsightCard } from './attendance-insight-card';
import { AttendanceSummary, type SummaryItem } from './attendance-summary';

interface AttendanceFollowupSectionProps {
  lateArrivalCount: number;
  missingPunchCount: number;
  summaryItems: SummaryItem[];
  avgWorkingHoursPercent: number;
}

export function AttendanceFollowupSection({
  lateArrivalCount,
  missingPunchCount,
  summaryItems,
  avgWorkingHoursPercent,
}: AttendanceFollowupSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-5 md:grid-cols-2">
          <AttendanceInsightCard
            title="Frequent Late Arrivals"
            metricLabel="No of Employees"
            metricValue={String(lateArrivalCount)}
            tag="Warnings"
            growth=""
            growthDirection="down"
            growthColor="red"
          />
          <AttendanceInsightCard
            title="Missing Punches"
            metricLabel="Total Number of Missing Punches"
            metricValue={String(missingPunchCount).padStart(2, '0')}
            tag="Critical"
            growth=""
            growthDirection="up"
            growthColor="green"
          />
        </div>
        <AttendanceSummary
          items={summaryItems}
          avgWorkingHoursPercent={avgWorkingHoursPercent}
        />
      </div>
    </div>
  );
}
