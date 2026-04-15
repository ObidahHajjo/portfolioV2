import { getPublishedCvAsset } from '@/lib/content/queries';
import { cn } from '@/lib/utils';

const cvDownloadButtonClassName =
  'group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary bg-clip-padding text-sm font-medium whitespace-nowrap text-primary-foreground transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40';

interface CvDownloadButtonProps {
  className?: string;
}

export async function CvDownloadButton({ className }: CvDownloadButtonProps) {
  const cv = await getPublishedCvAsset();

  if (!cv) {
    return null;
  }

  return (
    <a
      href="/api/cv/download"
      download={cv.fileName}
      className={cn(cvDownloadButtonClassName, className)}
    >
      Download CV
    </a>
  );
}
