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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur min-h-[65px]">
      <a
        id={skipLinkId}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-950 focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        href="#main-content"
        onClick={handleSkipLinkClick}
      >
        Skip to main content
      </a>
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <a
          className="inline-flex min-h-11 items-center rounded text-sm font-semibold uppercase tracking-[0.24em] text-gray-900 transition hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          href="#hero"
        >
          {developerName}
        </a>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.anchor}>
              <a
                className="rounded px-2 py-1 text-gray-600 transition hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
          className="inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 rounded-md transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
          onClick={handleMobileMenuToggle}
          type="button"
        >
          <span
            className={`h-0.5 w-6 bg-gray-900 transition ${isOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span className={`h-0.5 w-6 bg-gray-900 transition ${isOpen ? 'opacity-0' : ''}`} />
          <span
            className={`h-0.5 w-6 bg-gray-900 transition ${isOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </nav>

      <div
        ref={mobileMenuRef}
        aria-hidden={!isOpen}
        className={`${isOpen ? 'block border-t border-gray-200' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <ul className="space-y-1 px-6 py-4">
          {navLinks.map((link) => (
            <li key={link.anchor}>
              <a
                className="block rounded-md px-3 py-3 text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
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
