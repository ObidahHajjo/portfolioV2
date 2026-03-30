'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export default function EditOpenSourcePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetch(`/api/admin/open-source/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        form.reset({
          projectName: data.projectName,
          description: data.description,
          contributionType: data.contributionType,
          repositoryUrl: data.repositoryUrl || undefined,
          displayOrder: data.displayOrder,
          published: data.published,
          isVisible: data.isVisible,
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load contribution');
        router.push('/admin/open-source');
      });
  }, [params.id, form, router]);

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch(`/api/admin/open-source/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error('Failed to update contribution');
        return;
      }

      toast.success('Contribution updated');
      router.refresh();
    } catch {
      toast.error('Failed to update contribution');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this contribution?')) return;

    try {
      const response = await fetch(`/api/admin/open-source/${params.id}`, { method: 'DELETE' });
      if (!response.ok) {
        toast.error('Failed to delete');
        return;
      }
      toast.success('Contribution deleted');
      router.push('/admin/open-source');
      router.refresh();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Edit Open Source Contribution
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/open-source" />}>
            Back
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
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
                      <Input {...field} />
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
                      <Textarea {...field} rows={3} />
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
                      <Input {...field} />
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
                      <Input {...field} type="url" />
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
