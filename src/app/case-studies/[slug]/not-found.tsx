import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-12 text-center">
      <h1 className="text-3xl font-bold">Case Study Not Found</h1>
      <p className="mt-4 text-muted-foreground">
        The case study you&apos;re looking for doesn&apos;t exist or is not published.
      </p>
      <Link href="/case-studies" className="mt-6 inline-block text-primary hover:underline">
        ← Back to Case Studies
      </Link>
    </div>
  );
}
