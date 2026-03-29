'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormFieldMessage,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type EntityField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'date' | 'multiselect';
  options?: { value: string; label: string }[];
  inputType?: string;
};

type SubmissionError = {
  message?: string;
  fields?: Record<string, string | undefined>;
};

type FormValues = Record<string, unknown>;

export function EntityForm({
  schema,
  defaultValues,
  fields,
  onSubmit,
  submitLabel = 'Save',
  onError,
}: {
  schema: z.ZodType<FormValues>;
  defaultValues: FormValues;
  fields: EntityField[];
  onSubmit: (data: FormValues) => Promise<void>;
  submitLabel?: string;
  onError?: (message: string) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues,
  });

  const handleSubmit: SubmitHandler<FormValues> = async (data) => {
    setFormError(null);
    try {
      await onSubmit(data);
    } catch (error) {
      const submissionError = error as SubmissionError;
      const fieldErrors = submissionError.fields ?? {};

      Object.entries(fieldErrors).forEach(([fieldName, message]) => {
        if (!message) {
          return;
        }

        form.setError(fieldName, {
          message,
        });
      });

      const message = submissionError.message ?? 'Unable to save changes.';
      setFormError(message);
      onError?.(message);
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(handleSubmit)(event);
        }}
      >
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: controllerField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {field.type === 'textarea' ? (
                    <Textarea {...controllerField} value={String(controllerField.value ?? '')} />
                  ) : field.type === 'number' ? (
                    <Input
                      type="number"
                      value={String(controllerField.value ?? 0)}
                      onChange={(event) => controllerField.onChange(Number(event.target.value))}
                    />
                  ) : field.type === 'date' ? (
                    <Input
                      type="date"
                      value={
                        controllerField.value instanceof Date
                          ? controllerField.value.toISOString().slice(0, 10)
                          : String(controllerField.value ?? '')
                      }
                      onChange={controllerField.onChange}
                    />
                  ) : field.type === 'boolean' ? (
                    <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                      <Checkbox
                        checked={Boolean(controllerField.value)}
                        onCheckedChange={(checked) => controllerField.onChange(Boolean(checked))}
                      />
                      <span className="text-sm text-foreground">Enabled</span>
                    </label>
                  ) : field.type === 'select' ? (
                    <Select
                      value={String(controllerField.value ?? '')}
                      onValueChange={controllerField.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'multiselect' ? (
                    <div className="grid gap-2 rounded-lg border border-border p-3">
                      {field.options?.map((option) => {
                        const selectedValues = Array.isArray(controllerField.value)
                          ? (controllerField.value as string[])
                          : [];

                        return (
                          <label key={option.value} className="flex items-center gap-3 text-sm">
                            <Checkbox
                              checked={selectedValues.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const nextValues = checked
                                  ? [...selectedValues, option.value]
                                  : selectedValues.filter((value) => value !== option.value);

                                controllerField.onChange(nextValues);
                              }}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <Input
                      {...controllerField}
                      type={field.inputType ?? (field.name === 'password' ? 'password' : 'text')}
                      value={String(controllerField.value ?? '')}
                    />
                  )}
                </FormControl>
                <FormFieldMessage name={field.name} />
              </FormItem>
            )}
          />
        ))}

        {formError ? <FormMessage>{formError}</FormMessage> : null}

        <Button
          type="button"
          disabled={form.formState.isSubmitting}
          onClick={() => void form.handleSubmit(handleSubmit)()}
        >
          {form.formState.isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
