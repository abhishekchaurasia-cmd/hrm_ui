'use client';

import { Building2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessUnitsTab } from '@/features/admin/organization/components/business-units-tab';
import { DepartmentsTab } from '@/features/admin/organization/components/departments-tab';
import { LegalEntitiesTab } from '@/features/admin/organization/components/legal-entities-tab';
import { LocationsTab } from '@/features/admin/organization/components/locations-tab';

export function OrganizationSettingsScreen() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold">Organization Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your organization structure - legal entities, business units,
          departments, and locations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Organization Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="legal-entities">
            <TabsList className="mb-4">
              <TabsTrigger value="legal-entities">Legal Entities</TabsTrigger>
              <TabsTrigger value="business-units">Business Units</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>

            <TabsContent value="legal-entities">
              <LegalEntitiesTab />
            </TabsContent>
            <TabsContent value="business-units">
              <BusinessUnitsTab />
            </TabsContent>
            <TabsContent value="departments">
              <DepartmentsTab />
            </TabsContent>
            <TabsContent value="locations">
              <LocationsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
