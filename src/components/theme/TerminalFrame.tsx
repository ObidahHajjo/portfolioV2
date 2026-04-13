import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface TerminalFrameProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  title?: string;
  label?: string;
}

export default function TerminalFrame({
  children,
  className,
  contentClassName,
  title = '~/portfolio',
  label,
}: TerminalFrameProps) {
  return (
    <div className={cn('terminal-frame', className)}>
      <div className="terminal-frame-header">
        <div className="terminal-frame-dots" aria-hidden="true">
          <span className="terminal-frame-dot bg-red-400/80" />
          <span className="terminal-frame-dot bg-amber-300/80" />
          <span className="terminal-frame-dot bg-emerald-400/80" />
        </div>
        <span className="terminal-frame-title">{title}</span>
        <span className="terminal-frame-label">{label ?? 'public'}</span>
      </div>
      <div className={cn('terminal-frame-body', contentClassName)}>{children}</div>
    </div>
  );
}
