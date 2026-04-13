'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

interface MatrixBackdropProps {
  className?: string;
}

const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモラリルレロワヲン01{}[]<>/=;:.()+-*&^%$#@!~`|\\';

export default function MatrixBackdrop({ className }: MatrixBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    let animationFrame = 0;
    let drops: number[] = [];
    let columns = 0;
    const fontSize = 13;

    const resize = () => {
      const width = canvas.offsetWidth || window.innerWidth;
      const height = canvas.offsetHeight || window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      columns = Math.max(1, Math.floor(width / fontSize));
      drops = Array.from({ length: columns }, () => Math.random() * -100);
    };

    const draw = () => {
      context.fillStyle = 'rgba(3, 18, 12, 0.08)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = `${fontSize}px var(--font-heading), monospace`;

      for (let index = 0; index < drops.length; index += 1) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)] ?? '0';
        const x = index * fontSize;
        const drop = drops[index] ?? 0;
        const y = drop * fontSize;
        const alpha = 0.12 + Math.random() * 0.18;
        context.fillStyle = `rgba(84, 250, 147, ${alpha})`;
        context.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.985) {
          drops[index] = 0;
        }

        drops[index] = (drops[index] ?? 0) + 0.35 + Math.random() * 0.35;
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="matrix-backdrop"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full z-0 opacity-40 motion-reduce:hidden',
        className
      )}
    />
  );
}
