'use client';

import * as React from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const Form = FormProvider;

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return <Controller {...props} />;
};

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-2', className)} {...props} />;
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={cn('text-sm font-medium', className)} {...props} />;
}

function FormControl({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-1', className)} {...props} />;
}

function FormMessage({ className, children, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-sm text-destructive', className)} {...props}>
      {children}
    </p>
  );
}

function FormFieldMessage<TFieldValues extends FieldValues = FieldValues>({
  name,
  className,
}: {
  name: FieldPath<TFieldValues>;
  className?: string;
}) {
  const {
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const error = errors[name];

  if (!error || typeof error.message !== 'string') {
    return null;
  }

  return <FormMessage className={className}>{error.message}</FormMessage>;
}

export { Form, FormControl, FormField, FormFieldMessage, FormItem, FormLabel, FormMessage };
