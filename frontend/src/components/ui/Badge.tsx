import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeColor = 'neutral' | 'brand' | 'warning' | 'success' | 'error';

interface BadgeProps {
  color?: BadgeColor;
  size?: 'sm' | 'md';
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ color = 'neutral', size = 'sm', dot = false, children }: BadgeProps) {
  return (
    <span className={cn('hd-badge', `hd-badge--${color}`, `hd-badge--${size}`)}>
      {dot && <span className="hd-badge__dot" />}
      {children}
    </span>
  );
}
