import { Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface ProfileCardProps {
  name: string;
  role: string;
  avatar?: string;
  rating?: boolean;
  details: { label: string; value: string }[];
}

export function ProfileCard({
  name,
  role,
  avatar,
  rating,
  details,
}: ProfileCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="bg-muted flex size-10 items-center justify-center rounded-full text-lg font-semibold">
            {avatar ?? name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold">{name}</h3>
              {rating && (
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
              )}
            </div>
            <p className="text-muted-foreground text-sm">{role}</p>
          </div>
        </div>

        <div className="space-y-4">
          {details.map(detail => (
            <div key={detail.label}>
              <p className="text-muted-foreground text-xs">{detail.label}</p>
              <p className="text-sm">{detail.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
