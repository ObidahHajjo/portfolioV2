'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { caseStudyMetricSchema } from '@/lib/content/validation';

type Metric = {
  id: string;
  label: string;
  value: string;
  unit: string | null;
  displayOrder: number;
};

type FormValues = z.input<typeof caseStudyMetricSchema>;

export function CaseStudyMetricsEditor({
  caseStudyId,
  initialMetrics,
}: {
  caseStudyId: string;
  initialMetrics: Metric[];
}) {
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(caseStudyMetricSchema),
    defaultValues: {
      label: '',
      value: '',
      unit: undefined,
      displayOrder: 0,
    },
  });

  const refreshMetrics = async () => {
    const response = await fetch(`/api/admin/case-studies/${caseStudyId}/metrics`);
    if (response.ok) {
      const data = await response.json();
      setMetrics(data);
    }
  };

  const handleAdd = async (values: FormValues) => {
    try {
      const response = await fetch(`/api/admin/case-studies/${caseStudyId}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to add metric');
        return;
      }

      toast.success('Metric added');
      form.reset();
      setIsAdding(false);
      await refreshMetrics();
    } catch {
      toast.error('Failed to add metric');
    }
  };

  const handleUpdate = async (metricId: string, values: FormValues) => {
    try {
      const response = await fetch(`/api/admin/case-studies/${caseStudyId}/metrics/${metricId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update metric');
        return;
      }

      toast.success('Metric updated');
      setEditingId(null);
      await refreshMetrics();
    } catch {
      toast.error('Failed to update metric');
    }
  };

  const handleDelete = async (metricId: string) => {
    if (!window.confirm('Delete this metric?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/case-studies/${caseStudyId}/metrics/${metricId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Failed to delete metric');
        return;
      }

      toast.success('Metric deleted');
      await refreshMetrics();
    } catch {
      toast.error('Failed to delete metric');
    }
  };

  return (
    <div className="space-y-4">
      {metrics.length > 0 ? (
        <div className="divide-y rounded-lg border">
          {metrics.map((metric) => (
            <div key={metric.id} className="flex items-center justify-between p-4">
              {editingId === metric.id ? (
                <MetricEditForm
                  metric={metric}
                  onSave={(values) => handleUpdate(metric.id, values)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-medium">{metric.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {metric.value}
                      {metric.unit ? ` ${metric.unit}` : ''}
                      <span className="ml-2 text-xs">(order: {metric.displayOrder})</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(metric.id)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(metric.id)}>
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No metrics added yet.</p>
      )}

      {isAdding ? (
        <div className="rounded-lg border p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Deployment time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., -60%" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., %" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Metric</Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <Button onClick={() => setIsAdding(true)}>Add Metric</Button>
      )}
    </div>
  );
}

function MetricEditForm({
  metric,
  onSave,
  onCancel,
}: {
  metric: Metric;
  onSave: (values: FormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(caseStudyMetricSchema),
    defaultValues: {
      label: metric.label,
      value: metric.value,
      unit: metric.unit ?? undefined,
      displayOrder: metric.displayOrder,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="flex w-full flex-wrap items-end gap-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem className="w-24">
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem className="w-20">
              <FormLabel>Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 pb-0.5">
          <Button size="sm" type="submit">
            Save
          </Button>
          <Button size="sm" type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
