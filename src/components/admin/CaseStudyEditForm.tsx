'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
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
import { updateCaseStudySchema } from '@/lib/content/validation';

type FormValues = z.infer<typeof updateCaseStudySchema>;

type CaseStudyEditFormProps = {
  caseStudy: {
    id: string;
    slug: string;
    title: string;
    projectId: string | null;
    challenge: string;
    solution: string;
    outcomes: string;
    architectureNotes: string | null;
    displayOrder: number;
    published: boolean;
    isVisible: boolean;
    project?: { id: string; title: string } | null;
  };
  projects: { id: string; title: string }[];
};

export function CaseStudyEditForm({ caseStudy, projects }: CaseStudyEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(updateCaseStudySchema),
    defaultValues: {
      slug: caseStudy.slug,
      title: caseStudy.title,
      projectId: caseStudy.projectId ?? undefined,
      challenge: caseStudy.challenge,
      solution: caseStudy.solution,
      outcomes: caseStudy.outcomes,
      architectureNotes: caseStudy.architectureNotes ?? undefined,
      displayOrder: caseStudy.displayOrder,
      published: caseStudy.published,
      isVisible: caseStudy.isVisible,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/case-studies/${caseStudy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.error('Failed to update case study');
        }
        return;
      }

      toast.success('Case study updated');
      router.refresh();
    } catch {
      toast.error('Failed to update case study');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this case study?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/case-studies/${caseStudy.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Failed to delete case study');
        return;
      }

      toast.success('Case study deleted');
      router.push('/admin/case-studies');
      router.refresh();
    } catch {
      toast.error('Failed to delete case study');
    }
  };

  return (
    <>
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" render={<Link href="/admin/case-studies" />}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
