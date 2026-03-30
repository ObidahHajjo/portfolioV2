'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { OpenSourceSchema } from '@/lib/admin/validation';

type FormValues = z.infer<typeof OpenSourceSchema>;

export default function NewOpenSourcePage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(OpenSourceSchema),
    defaultValues: {
      projectName: '',
      description: '',
      contributionType: '',
      repositoryUrl: undefined,
      displayOrder: 0,
      published: false,
      isVisible: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch('/api/admin/open-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to create contribution');
        return;
      }

      toast.success('Contribution created');
      router.push('/admin/open-source');
      router.refresh();
    } catch {
      toast.error('Failed to create contribution');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            New Open Source Contribution
          </h1>
        </div>
        <Button variant="outline" render={<Link href="/admin/open-source" />}>
          Back
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Contribution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Project name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="What did you contribute?" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contributionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Bug fix, Feature, Documentation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="repositoryUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository URL (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://github.com/..." type="url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
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

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Published</FormLabel>
                      <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        />
                        <span className="text-sm">Published</span>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visible</FormLabel>
                      <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        />
                        <span className="text-sm">Visible</span>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Creating...' : 'Create Contribution'}
                </Button>
                <Button type="button" variant="outline" render={<Link href="/admin/open-source" />}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
