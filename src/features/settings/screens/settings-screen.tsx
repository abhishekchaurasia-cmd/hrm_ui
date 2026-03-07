import { Moon, Settings } from 'lucide-react';

import { ThemeToggle } from '@/components/header/theme-toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SettingsScreen() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="text-muted-foreground size-4" />
            <span>Theme Mode</span>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
