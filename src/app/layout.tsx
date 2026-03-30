import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'Alex Carter | Senior Software Engineer',
    template: '%s | Alex Carter',
  },
  description:
    'Senior software engineer building resilient web platforms, thoughtful developer tools, and scalable product experiences.',
  openGraph: {
    type: 'website',
    title: 'Alex Carter | Senior Software Engineer',
    description:
      'Senior software engineer building resilient web platforms, thoughtful developer tools, and scalable product experiences.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">{children}</body>
    </html>
  );
}
