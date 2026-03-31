import { db } from '@/lib/db';
import { env } from '@/lib/config/env';
import type { SeoMetadata } from '@prisma/client';

export type ResolvedMetadata = {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
};

const DEFAULT_OG_IMAGE = '/og/portfolio-default.svg';

type MetadataFallback = {
  title: string;
  description: string;
};

const PAGE_DEFAULTS: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Alex Carter | Senior Software Engineer',
    description:
      'Senior software engineer building resilient web platforms, thoughtful developer tools, and scalable product experiences.',
  },
  '/case-studies': {
    title: 'Case Studies | Alex Carter',
    description:
      'In-depth case studies showcasing platform migrations, architecture decisions, and delivery outcomes.',
  },
};

export async function resolveMetadata(
  pagePath: string,
  fallback?: MetadataFallback
): Promise<ResolvedMetadata> {
  const normalizedPath = normalizePath(pagePath);
  const overrides = await fetchOverrides(normalizedPath);
  const defaults = fallback ??
    PAGE_DEFAULTS[normalizedPath] ?? {
      title: 'Alex Carter | Senior Software Engineer',
      description: 'Portfolio of Alex Carter, senior software engineer.',
    };
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  return {
    title: overrides?.pageTitle ?? defaults.title,
    description: overrides?.metaDescription ?? defaults.description,
    canonicalUrl: overrides?.canonicalUrl ?? `${baseUrl}${normalizedPath}`,
    ogTitle: overrides?.ogTitle ?? overrides?.pageTitle ?? defaults.title,
    ogDescription: overrides?.ogDescription ?? overrides?.metaDescription ?? defaults.description,
    ogImageUrl: overrides?.ogImageUrl ?? `${baseUrl}${DEFAULT_OG_IMAGE}`,
  };
}

async function fetchOverrides(pagePath: string): Promise<SeoMetadata | null> {
  try {
    return await db.seoMetadata.findUnique({
      where: { pageSlug: pagePath },
    });
  } catch {
    return null;
  }
}

function normalizePath(path: string): string {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path === '' ? '/' : path;
}
