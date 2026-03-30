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
import { TestimonialSchema } from '@/lib/admin/validation';

type FormValues = z.input<typeof TestimonialSchema>;

type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string;
  authorCompany: string | null;
  avatarUrl: string | null;
  quote: string;
  displayOrder: number;
  published: boolean;
  isVisible: boolean;
};

export default function EditTestimonialPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(TestimonialSchema),
    defaultValues: {
      authorName: '',
      authorRole: '',
      authorCompany: '',
      avatarUrl: '',
      quote: '',
      displayOrder: 0,
      published: false,
      isVisible: true,
    },
  });

  useEffect(() => {
    fetch(`/api/admin/testimonials/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTestimonial(data);
        form.reset({
          authorName: data.authorName,
          authorRole: data.authorRole,
          authorCompany: data.authorCompany ?? '',
          avatarUrl: data.avatarUrl ?? '',
          quote: data.quote,
          displayOrder: data.displayOrder,
          published: data.published,
          isVisible: data.isVisible,
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load testimonial');
        setLoading(false);
      });
  }, [params.id, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update testimonial');
        return;
      }

      toast.success('Testimonial updated');
      router.push('/admin/testimonials');
      router.refresh();
    } catch {
      toast.error('Failed to update testimonial');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this testimonial?')) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Failed to delete testimonial');
        return;
      }

      toast.success('Testimonial deleted');
      router.push('/admin/testimonials');
      router.refresh();
    } catch {
      toast.error('Failed to delete testimonial');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!testimonial) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Testimonial not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Edit Testimonial</h1>
          <p className="mt-2 text-sm text-muted-foreground">Update testimonial details.</p>
        </div>
        <Button variant="outline" render={<Link href="/admin/testimonials" />}>
          Back
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Testimonial Details</CardTitle>
          <CardDescription>Edit the quote and author information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Jane Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author Role</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Senior Engineer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author Company (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Acme Corp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/avatar.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="What people say..." rows={4} />
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
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  render={<Link href="/admin/testimonials" />}
                >
                  Cancel
                </Button>
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
