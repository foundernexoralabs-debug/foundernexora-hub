// @polsia:user-owned — the FounderLab mark: an "F" with Renor's orb as the dot.
// Mirrors src/app/icon.svg so the favicon, header and footer show one identity.
import { useId } from 'react';
import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  const gradient = `fl-mark-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('size-7 shrink-0', className)}
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#3730a3" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradient})`} />
      <path d="M10 8.5h12v3.2h-8.6v3.4h7.2v3.2h-7.2v5.2H10z" fill="#ffffff" />
      <circle cx="22.2" cy="21.4" r="2.6" fill="#7dd3fc" />
    </svg>
  );
}
