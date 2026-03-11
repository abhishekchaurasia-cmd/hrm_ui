'use client';

import {
  Banknote,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  Edit,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmployeeProfilePage } from '@/features/admin/employee-profile';
import {
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
} from '@/features/admin/employee-profile/api/employee-profile';

import type { EmployeeProfile } from '@/features/admin/employee-profile/types/employee-profile';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTimeType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

interface EditFormState {
  middleName: string;
  displayName: string;
  mobileNumber: string;
  dateOfBirth: string;
  nationality: string;
  workCountry: string;
  gender: string;
}

export function ProfileScreen() {
  const { data: session, status: sessionStatus } = useSession();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    middleName: '',
    displayName: '',
    mobileNumber: '',
    dateOfBirth: '',
    nationality: '',
    workCountry: '',
    gender: '',
  });

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyEmployeeProfile();
      setProfile(res.data);
    } catch {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      void fetchProfile();
    }
  }, [sessionStatus, fetchProfile]);

  const openEditDialog = () => {
    if (!profile) return;
    setEditForm({
      middleName: profile.middleName ?? '',
      displayName: profile.displayName ?? '',
      mobileNumber: profile.mobileNumber ?? '',
      dateOfBirth: profile.dateOfBirth?.slice(0, 10) ?? '',
      nationality: profile.nationality ?? '',
      workCountry: profile.workCountry ?? '',
      gender: profile.gender ?? '',
    });
    setShowEdit(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        middleName: editForm.middleName.trim() || null,
        displayName: editForm.displayName.trim() || null,
        mobileNumber: editForm.mobileNumber.trim() || null,
        dateOfBirth: editForm.dateOfBirth || null,
        nationality: editForm.nationality.trim() || null,
        workCountry: editForm.workCountry.trim() || null,
        gender: (editForm.gender || null) as 'male' | 'female' | 'other' | null,
      };
      await updateMyEmployeeProfile(payload);
      toast.success('Profile updated successfully');
      setShowEdit(false);
      void fetchProfile();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Loading profile...</p>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="py-12">
        <p className="text-destructive text-sm">
          Unable to resolve user profile.
        </p>
      </div>
    );
  }

  if (session.user.role === 'hr') {
    return (
      <EmployeeProfilePage
        userId="me"
        departmentReadOnly
        pageTitle="HR Profile"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <p className="text-muted-foreground text-sm">
            View your profile details.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-destructive text-sm">
              {error ?? 'Profile not found'}
            </p>
            <Button variant="outline" onClick={() => void fetchProfile()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const compensation = profile.compensation;
  const shiftAssignment = profile.shiftAssignment;
  const leavePlanAssignment = profile.leavePlanAssignment;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <p className="text-muted-foreground text-sm">
            View your profile details. Some fields can be edited by you.
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full text-xl font-bold">
            {(profile.user?.firstName ?? profile.firstName ?? '?').charAt(0)}
            {(profile.user?.lastName ?? profile.lastName ?? '?').charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {profile.displayName ??
                `${profile.user?.firstName ?? profile.firstName ?? ''} ${profile.user?.lastName ?? profile.lastName ?? ''}`}
            </h2>
            <p className="text-muted-foreground text-sm">
              {profile.jobTitle ?? 'Employee'}
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {profile.employeeNumber && (
                <Badge variant="secondary">{profile.employeeNumber}</Badge>
              )}
              {profile.user?.department?.name && (
                <Badge variant="outline">{profile.user.department.name}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Personal Information
            </CardTitle>
            <Button variant="outline" size="sm" onClick={openEditDialog}>
              <Edit className="size-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow
            label="First Name"
            value={profile.user?.firstName ?? profile.firstName}
          />
          <InfoRow
            label="Last Name"
            value={profile.user?.lastName ?? profile.lastName}
          />
          <InfoRow label="Middle Name" value={profile.middleName} />
          <InfoRow label="Display Name" value={profile.displayName} />
          <InfoRow
            label="Gender"
            value={profile.gender ? formatTimeType(profile.gender) : null}
          />
          <InfoRow
            label="Date of Birth"
            value={formatDate(profile.dateOfBirth)}
          />
          <InfoRow label="Nationality" value={profile.nationality} />
          <InfoRow label="Work Country" value={profile.workCountry} />
          <div className="flex items-center gap-2">
            <Phone className="text-muted-foreground size-4" />
            <div>
              <p className="text-muted-foreground text-xs">Mobile Number</p>
              <p className="text-sm font-medium">
                {profile.mobileNumber || '-'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="text-muted-foreground size-4" />
            <div>
              <p className="text-muted-foreground text-xs">Email</p>
              <p className="text-sm font-medium">
                {profile.user?.email ?? profile.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Identifiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Employment Identifiers
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Employee Number" value={profile.employeeNumber} />
          <InfoRow label="Number Series" value={profile.numberSeries} />
          <InfoRow label="Attendance Number" value={profile.attendanceNumber} />
        </CardContent>
      </Card>

      {/* Job Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-5" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow
            label="Joining Date"
            value={formatDate(profile.joiningDate)}
          />
          <InfoRow label="Job Title" value={profile.jobTitle} />
          <InfoRow
            label="Secondary Job Title"
            value={profile.secondaryJobTitle}
          />
          <InfoRow label="Time Type" value={formatTimeType(profile.timeType)} />
          <InfoRow
            label="Worker Type"
            value={
              profile.workerType ? formatTimeType(profile.workerType) : null
            }
          />
          <InfoRow
            label="Reporting Manager"
            value={
              profile.reportingManager
                ? `${profile.reportingManager.firstName} ${profile.reportingManager.lastName}`
                : null
            }
          />
          <InfoRow
            label="Dotted Line Manager"
            value={
              profile.dottedLineManager
                ? `${profile.dottedLineManager.firstName} ${profile.dottedLineManager.lastName}`
                : null
            }
          />
        </CardContent>
      </Card>

      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Department" value={profile.user?.department?.name} />
          <InfoRow label="Legal Entity" value={profile.legalEntity?.name} />
          <InfoRow label="Business Unit" value={profile.businessUnit?.name} />
          <InfoRow label="Location" value={profile.location?.name} />
          <InfoRow
            label="Probation Period"
            value={
              profile.probationPolicyMonths !== null &&
              profile.probationPolicyMonths !== undefined
                ? `${profile.probationPolicyMonths} months`
                : null
            }
          />
          <InfoRow
            label="Notice Period"
            value={
              profile.noticePeriodDays !== null &&
              profile.noticePeriodDays !== undefined
                ? `${profile.noticePeriodDays} days`
                : null
            }
          />
          <InfoRow label="Holiday List" value={profile.holidayList?.name} />
        </CardContent>
      </Card>

      {/* Compensation */}
      {compensation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="size-5" />
              Compensation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow
                label="Annual Salary"
                value={formatCurrency(
                  compensation.annualSalary,
                  compensation.currency
                )}
              />
              <InfoRow
                label="Regular Salary"
                value={formatCurrency(
                  compensation.regularSalary,
                  compensation.currency
                )}
              />
              <InfoRow
                label="Bonus"
                value={
                  compensation.bonus !== null &&
                  compensation.bonus !== undefined
                    ? formatCurrency(compensation.bonus, compensation.currency)
                    : null
                }
              />
              <InfoRow
                label="Effective From"
                value={formatDate(compensation.salaryEffectiveFrom)}
              />
              <InfoRow
                label="Tax Regime"
                value={
                  compensation.taxRegime
                    ? formatTimeType(compensation.taxRegime)
                    : null
                }
              />
            </div>
            {compensation.breakups?.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-2 text-xs font-medium">
                    Salary Breakup
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead className="text-right">Monthly</TableHead>
                        <TableHead className="text-right">Annual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compensation.breakups.map(b => (
                        <TableRow key={b.id}>
                          <TableCell>{b.salaryComponent.name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              b.monthlyAmount,
                              compensation.currency
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              b.annualAmount,
                              compensation.currency
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shift Assignment */}
      {shiftAssignment?.shift && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Shift Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Shift Name" value={shiftAssignment.shift.name} />
            <InfoRow label="Shift Code" value={shiftAssignment.shift.code} />
            <InfoRow
              label="Timing"
              value={`${shiftAssignment.shift.startTime} - ${shiftAssignment.shift.endTime}`}
            />
            <InfoRow
              label="Work Hours/Day"
              value={`${shiftAssignment.shift.workHoursPerDay} hours`}
            />
            <InfoRow
              label="Grace Minutes"
              value={`${shiftAssignment.shift.graceMinutes} minutes`}
            />
            <InfoRow
              label="Effective From"
              value={formatDate(shiftAssignment.effectiveFrom)}
            />
            {shiftAssignment.shift.weeklyOffs?.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-xs">Weekly Offs</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {shiftAssignment.shift.weeklyOffs.map(wo => (
                    <Badge key={wo.dayOfWeek} variant="outline">
                      {DAY_NAMES[wo.dayOfWeek]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leave Plan */}
      {leavePlanAssignment?.leavePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-5" />
              Leave Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label="Plan Name"
              value={leavePlanAssignment.leavePlan.name}
            />
            <InfoRow
              label="Year"
              value={String(leavePlanAssignment.leavePlan.year)}
            />
            <InfoRow
              label="Effective From"
              value={formatDate(leavePlanAssignment.effectiveFrom)}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Personal Info Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Personal Information</DialogTitle>
            <DialogDescription>
              Update your personal details. Other fields are managed by HR.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={editForm.displayName}
                onChange={e =>
                  setEditForm(p => ({ ...p, displayName: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={editForm.middleName}
                onChange={e =>
                  setEditForm(p => ({ ...p, middleName: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={editForm.gender}
                onValueChange={v => setEditForm(p => ({ ...p, gender: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={editForm.dateOfBirth}
                onChange={e =>
                  setEditForm(p => ({ ...p, dateOfBirth: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                value={editForm.mobileNumber}
                onChange={e =>
                  setEditForm(p => ({ ...p, mobileNumber: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={editForm.nationality}
                onChange={e =>
                  setEditForm(p => ({ ...p, nationality: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workCountry">Work Country</Label>
              <Input
                id="workCountry"
                value={editForm.workCountry}
                onChange={e =>
                  setEditForm(p => ({ ...p, workCountry: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEdit(false)}
              disabled={isSaving}
            >
              <X className="size-4" />
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              <Save className="size-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
