'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/profile', label: 'Profile' },
  { href: '/admin/hero', label: 'Hero' },
  { href: '/admin/contact-settings', label: 'Contact Settings' },
  { href: '/admin/social-links', label: 'Social Links' },
  { href: '/admin/experiences', label: 'Experiences' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/case-studies', label: 'Case Studies' },
  { href: '/admin/skills', label: 'Skills' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/seo-metadata', label: 'SEO Metadata' },
  { href: '/admin/media-assets', label: 'Media Assets' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    const response = await fetch('/api/admin/auth/logout', {
      method: 'POST',
    });

    if (response.ok) {
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b bg-background lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-b-0">
          <div className="border-b px-6 py-5">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Portfolio CMS
            </p>
            <h1 className="mt-2 text-xl font-semibold text-foreground">Admin Portal</h1>
          </div>
          <nav className="grid gap-1 p-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Internal Only
                </p>
                <h2 className="text-lg font-semibold text-foreground">Admin Portal</h2>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
