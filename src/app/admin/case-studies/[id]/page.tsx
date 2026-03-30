import { notFound } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { CaseStudyMetricsEditor } from '@/components/admin/CaseStudyMetricsEditor';
import { CaseStudyEditForm } from '@/components/admin/CaseStudyEditForm';

export const dynamic = 'force-dynamic';

export default async function EditCaseStudyPage({ params }: { params: { id: string } }) {
  const [caseStudy, projects, metrics] = await Promise.all([
    db.caseStudy.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, title: true } },
      },
    }),
    db.project.findMany({
      where: { published: true },
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    }),
    db.caseStudyMetric.findMany({
      where: { caseStudyId: params.id },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  if (!caseStudy) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Edit Case Study</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update case study details and manage metrics.
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
          <CaseStudyEditForm caseStudy={caseStudy} projects={projects} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
          <CardDescription>
            Add highlighted metrics to display as callout cards on the case study page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CaseStudyMetricsEditor caseStudyId={caseStudy.id} initialMetrics={metrics} />
        </CardContent>
      </Card>
    </section>
  );
}
