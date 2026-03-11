import { ProfileSectionCard } from '@/features/admin/employee-profile/components/profile-section-card';

import type { EmployeeProfileFormValues } from '@/features/admin/employee-profile/schema/employee-profile.schema';

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm break-all">{value}</p>
    </div>
  );
}

interface ProfileMetadataCardProps {
  values: Pick<
    EmployeeProfileFormValues,
    'id' | 'userId' | 'email' | 'createdAt' | 'updatedAt'
  >;
}

export function ProfileMetadataCard({ values }: ProfileMetadataCardProps) {
  return (
    <ProfileSectionCard title="Profile Metadata">
      <div className="grid gap-4 md:grid-cols-2">
        <MetadataRow label="Profile ID" value={values.id} />
        <MetadataRow label="User ID" value={values.userId} />
        <MetadataRow label="Email" value={values.email} />
        <MetadataRow
          label="Created At"
          value={new Date(values.createdAt).toLocaleString()}
        />
        <MetadataRow
          label="Updated At"
          value={new Date(values.updatedAt).toLocaleString()}
        />
      </div>
    </ProfileSectionCard>
  );
}
