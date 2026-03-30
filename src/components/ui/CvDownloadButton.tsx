import { getPublishedCvAsset } from '@/lib/content/queries';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export async function CvDownloadButton() {
  const cv = await getPublishedCvAsset();

  if (!cv) {
    return null;
  }

  return (
    <a
      href="/api/cv/download"
      download={cv.fileName}
      className={cn(buttonVariants({ variant: 'default' }))}
    >
      Download CV
    </a>
  );
}
