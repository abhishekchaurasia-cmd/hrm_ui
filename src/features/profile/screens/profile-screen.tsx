import { Mail, Phone, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProfileScreen() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Your personal and work details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Employee Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs">Full Name</p>
            <p className="font-medium">Stephan Peralt</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Role</p>
            <p className="font-medium">Senior Product Designer</p>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="text-muted-foreground size-4" />
            <p>steperde124@example.com</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="text-muted-foreground size-4" />
            <p>+1 324 3453 545</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
