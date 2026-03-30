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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createCaseStudySchema } from '@/lib/content/validation';
import type { Project } from '@prisma/client';

type FormValues = z.input<typeof createCaseStudySchema>;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 150);
}

export default function NewCaseStudyPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createCaseStudySchema),
    defaultValues: {
      slug: '',
      title: '',
      projectId: undefined,
      challenge: '',
      solution: '',
      outcomes: '',
      architectureNotes: undefined,
      displayOrder: 0,
      published: false,
      isVisible: true,
    },
  });

  useEffect(() => {
    fetch('/api/admin/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(() => toast.error('Failed to load projects'));
  }, []);

  const title = form.watch('title');

  useEffect(() => {
    if (title && !form.getValues('slug')) {
      form.setValue('slug', generateSlug(title));
    }
  }, [title, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.error('Failed to create case study');
        }
        return;
      }

      toast.success('Case study created');
      router.push('/admin/case-studies');
      router.refresh();
    } catch {
      toast.error('Failed to create case study');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">New Case Study</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a new case study with narrative and metrics.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/admin/case-studies" />}>
          Back
        </Button>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Case Study Details</CardTitle>
          <CardDescription>
            Describe the challenge, solution, and outcomes in detail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter case study title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="url-friendly-slug" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Link (optional)</FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={(v) => field.onChange(v || undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="challenge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>The Challenge</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the problem or challenge faced"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="solution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>The Solution</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the approach and implementation"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outcomes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>The Outcome</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe the results and impact" rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="architectureNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Architecture &amp; Decisions (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Document key architectural decisions and rationale"
                        rows={3}
                      />
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Case Study'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  render={<Link href="/admin/case-studies" />}
                >
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
