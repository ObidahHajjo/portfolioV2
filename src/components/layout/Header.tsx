'use client';

import { useEffect, useRef, useState, useId } from 'react';

import type { NavLink } from '@/types/portfolio';

interface HeaderProps {
  developerName: string;
  navLinks: NavLink[];
}

export default function Header({ developerName, navLinks }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const skipLinkId = useId();
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const handleSkipLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMobileMenuToggle = () => {
    setIsOpen((value) => !value);
  };

  const handleMobileLinkClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusable?.[0];
    firstFocusable?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const nodes = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!nodes || nodes.length === 0) {
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) {
        return;
      }
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 min-h-[65px] border-b border-border bg-background/90 shadow-terminal backdrop-blur">
      <a id={skipLinkId} className="skip-link" href="#main-content" onClick={handleSkipLinkClick}>
        Skip to main content
      </a>
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <a
          className="inline-flex min-h-11 items-center rounded px-2 font-mono text-sm font-semibold uppercase tracking-[0.24em] text-foreground transition hover:text-primary focus-ring"
          href="#hero"
        >
          <span className="text-primary">$</span>
          <span className="ml-2 truncate">{developerName || 'portfolio'}</span>
        </a>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.anchor}>
              <a
                className="rounded px-2 py-1 font-mono text-sm text-muted-foreground transition hover:text-primary focus-ring"
                href={`#${link.anchor}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          ref={menuButtonRef}
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 rounded-md border border-border bg-card/70 transition hover:border-primary/40 hover:text-primary focus-ring md:hidden"
          onClick={handleMobileMenuToggle}
          type="button"
        >
          <span
            className={`h-0.5 w-6 bg-current transition ${isOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span className={`h-0.5 w-6 bg-current transition ${isOpen ? 'opacity-0' : ''}`} />
          <span
            className={`h-0.5 w-6 bg-current transition ${isOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </nav>

      <div
        ref={mobileMenuRef}
        aria-hidden={!isOpen}
        className={`${isOpen ? 'block border-t border-border bg-background/95' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <ul className="space-y-1 px-6 py-4">
          {navLinks.map((link) => (
            <li key={link.anchor}>
              <a
                className="block rounded-md border border-transparent px-3 py-3 font-mono text-sm text-muted-foreground transition hover:border-primary/30 hover:bg-card/80 hover:text-primary focus-ring"
                href={`#${link.anchor}`}
                onClick={handleMobileLinkClick}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
