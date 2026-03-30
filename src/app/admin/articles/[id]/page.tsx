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
import { ArticleSchema } from '@/lib/admin/validation';

type FormValues = z.infer<typeof ArticleSchema>;

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(ArticleSchema),
    defaultValues: {
      title: '',
      summary: '',
      externalUrl: '',
      publishedAt: undefined,
      displayOrder: 0,
      published: false,
      isVisible: true,
    },
  });

  useEffect(() => {
    fetch(`/api/admin/articles/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        form.reset({
          title: data.title,
          summary: data.summary,
          externalUrl: data.externalUrl,
          publishedAt: data.publishedAt || undefined,
          displayOrder: data.displayOrder,
          published: data.published,
          isVisible: data.isVisible,
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load article');
        router.push('/admin/articles');
      });
  }, [params.id, form, router]);

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch(`/api/admin/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update article');
        return;
      }

      toast.success('Article updated');
      router.refresh();
    } catch {
      toast.error('Failed to update article');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this article?')) return;

    try {
      const response = await fetch(`/api/admin/articles/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Failed to delete article');
        return;
      }

      toast.success('Article deleted');
      router.push('/admin/articles');
      router.refresh();
    } catch {
      toast.error('Failed to delete article');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Edit Article</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/articles" />}>
            Back
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
          <CardDescription>Update the article link and details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Article title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Brief summary" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="externalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." type="url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Published At (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ? field.value.slice(0, 16) : ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value).toISOString() : undefined
                          )
                        }
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
