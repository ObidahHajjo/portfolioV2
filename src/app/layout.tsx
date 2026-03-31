import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { resolveMetadata } from '@/lib/seo/metadata';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const resolved = await resolveMetadata('/');

  return {
    title: {
      default: resolved.title,
      template: `%s | Alex Carter`,
    },
    description: resolved.description,
    alternates: {
      canonical: resolved.canonicalUrl,
    },
    openGraph: {
      type: 'website',
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      url: resolved.canonicalUrl,
      images: [{ url: resolved.ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      images: [resolved.ogImageUrl],
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
        <PageViewTracker />
      </body>
    </html>
  );
}
