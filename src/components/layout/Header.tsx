'use client';

import { useState } from 'react';

import type { NavLink } from '@/types/portfolio';

interface HeaderProps {
  developerName: string;
  navLinks: NavLink[];
}

export default function Header({ developerName, navLinks }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900 focus:shadow-lg"
        href="#main-content"
      >
        Skip to content
      </a>
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <a
          className="inline-flex min-h-11 items-center rounded text-sm font-semibold uppercase tracking-[0.24em] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          href="#hero"
        >
          {developerName}
        </a>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.anchor}>
              <a
                className="rounded text-gray-600 transition hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                href={`#${link.anchor}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <span className="h-0.5 w-6 bg-gray-900" />
          <span className="h-0.5 w-6 bg-gray-900" />
          <span className="h-0.5 w-6 bg-gray-900" />
        </button>
      </nav>

      <div
        className={isOpen ? 'block border-t border-gray-200 md:hidden' : 'hidden'}
        id="mobile-menu"
      >
        <ul className="space-y-2 px-6 py-4">
          {navLinks.map((link) => (
            <li key={link.anchor}>
              <a
                className="block rounded px-2 py-3 text-gray-700 transition hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                href={`#${link.anchor}`}
                onClick={() => setIsOpen(false)}
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
