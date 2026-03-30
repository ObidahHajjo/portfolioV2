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
import { TestimonialSchema } from '@/lib/admin/validation';

type FormValues = z.input<typeof TestimonialSchema>;

export default function NewTestimonialPage() {
  const router = useRouter();

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

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to create testimonial');
        return;
      }

      toast.success('Testimonial created');
      router.push('/admin/testimonials');
      router.refresh();
    } catch {
      toast.error('Failed to create testimonial');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">New Testimonial</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a new testimonial with author attribution.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/admin/testimonials" />}>
          Back
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Testimonial Details</CardTitle>
          <CardDescription>Enter the quote and author information.</CardDescription>
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
                  {form.formState.isSubmitting ? 'Creating...' : 'Create Testimonial'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  render={<Link href="/admin/testimonials" />}
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
