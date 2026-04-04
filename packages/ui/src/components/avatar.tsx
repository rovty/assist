import * as React from 'react';
import { cn } from '../lib/utils';

const avatarSizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  alt?: string;
  fallback?: string;
  size?: keyof typeof avatarSizes;
}

function Avatar({ className, name, src, alt, fallback, size = 'md', ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const fallbackText = fallback ?? name;

  const initials = fallbackText
    ? fallbackText
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted',
        avatarSizes[size],
        className,
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt ?? fallbackText ?? ''}
          className="block h-full w-full object-cover object-center"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-medium text-muted-foreground">{initials}</span>
      )}
    </div>
  );
}

export { Avatar };
export type { AvatarProps };
