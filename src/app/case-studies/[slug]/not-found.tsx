import Link from 'next/link';

import TerminalFrame from '@/components/theme/TerminalFrame';

export default function NotFound() {
  return (
    <div className="public-theme min-h-screen">
      <section className="terminal-section">
        <div className="mx-auto max-w-4xl text-center">
          <TerminalFrame title="~/public/case-studies/not-found" label="404">
            <h1 className="terminal-heading text-[clamp(2rem,3vw,3rem)]">Case Study Not Found</h1>
            <p className="mt-4 terminal-copy">
              The case study you&apos;re looking for doesn&apos;t exist or is not published.
            </p>
            <Link
              href="/case-studies"
              className="terminal-button-secondary focus-ring mt-6 inline-flex"
            >
              Back to Case Studies
            </Link>
          </TerminalFrame>
        </div>
      </section>
    </div>
  );
}
