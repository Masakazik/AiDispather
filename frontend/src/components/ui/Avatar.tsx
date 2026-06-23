import { useMemo } from 'react';
import { cn } from '@/utils/cn';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Presence = 'online' | 'away' | 'offline';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  presence?: Presence;
}

const SIZE_PX: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

/** Solid brand palette (matches the Cloud Design source): one color per name, white initials. */
const PALETTE = ['#2553e0', '#1f8a4c', '#c47f0b', '#7a5bd6', '#0e8a8a', '#cc2f2d'];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join('').toUpperCase() || '?';
}

export function Avatar({ name, size = 'md', presence }: AvatarProps) {
  const px = SIZE_PX[size];
  const bg = useMemo(() => PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length], [name]);
  const dot = Math.max(8, Math.round(px * 0.28));

  return (
    <span className="hd-avatar" style={{ width: px, height: px }}>
      <span
        className="hd-avatar__circle"
        style={{ background: bg, fontSize: Math.round(px * 0.4) }}
        title={name}
      >
        {initialsOf(name)}
      </span>
      {presence && (
        <span
          className={cn('hd-avatar__presence', `hd-avatar__presence--${presence}`)}
          style={{ width: dot, height: dot }}
        />
      )}
    </span>
  );
}
