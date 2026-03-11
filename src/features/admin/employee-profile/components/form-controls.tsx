'use client';

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type { OptionItem } from '@/features/admin/employee-profile/types/employee-profile';

interface BaseFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-xs">{message}</p>;
}

export function RHFTextInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  required,
}: BaseFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {label}
            {required ? ' *' : ''}
          </Label>
          <Input
            id={field.name}
            value={field.value ?? ''}
            onChange={event => {
              const nextValue = event.target.value;
              field.onChange(nextValue === '' ? null : nextValue);
            }}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            placeholder={placeholder}
            disabled={disabled}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}

export function RHFNumberInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  required,
  min,
  max,
}: BaseFieldProps<TFieldValues> & { min?: number; max?: number }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {label}
            {required ? ' *' : ''}
          </Label>
          <Input
            id={field.name}
            type="number"
            min={min}
            max={max}
            value={field.value ?? ''}
            onChange={event => {
              const nextValue = event.target.value;
              field.onChange(nextValue === '' ? null : Number(nextValue));
            }}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            placeholder={placeholder}
            disabled={disabled}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}

export function RHFDateInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  disabled,
  required,
}: BaseFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {label}
            {required ? ' *' : ''}
          </Label>
          <Input
            id={field.name}
            type="date"
            value={field.value ?? ''}
            onChange={event =>
              field.onChange(
                event.target.value === '' ? null : event.target.value
              )
            }
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            disabled={disabled}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}

export function RHFSelectInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  required,
  options,
  allowClear,
}: BaseFieldProps<TFieldValues> & {
  options: OptionItem[];
  allowClear?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {label}
            {required ? ' *' : ''}
          </Label>
          <Select
            value={field.value ?? ''}
            onValueChange={value =>
              field.onChange(value === '__clear__' ? null : value)
            }
            disabled={disabled}
          >
            <SelectTrigger id={field.name}>
              <SelectValue placeholder={placeholder ?? 'Select option'} />
            </SelectTrigger>
            <SelectContent>
              {allowClear ? (
                <SelectItem value="__clear__">Not set</SelectItem>
              ) : null}
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}

export function RHFToggleInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  disabled,
}: BaseFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const checked = Boolean(field.value);
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <Label htmlFor={field.name}>{label}</Label>
              <button
                id={field.name}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => field.onChange(!checked)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  checked ? 'bg-primary' : 'bg-muted',
                  disabled ? 'cursor-not-allowed opacity-60' : ''
                )}
              >
                <span
                  className={cn(
                    'bg-background absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform',
                    checked ? 'translate-x-5' : ''
                  )}
                />
              </button>
            </div>
            <FieldError message={fieldState.error?.message} />
          </div>
        );
      }}
    />
  );
}
