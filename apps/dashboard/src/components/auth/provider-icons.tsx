'use client';

export function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M21.805 12.23c0-.72-.064-1.412-.184-2.077H12v3.932h5.498a4.702 4.702 0 0 1-2.036 3.086v2.564h3.295c1.93-1.777 3.048-4.398 3.048-7.505Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.075-.915 6.767-2.478l-3.295-2.564c-.915.613-2.084.975-3.472.975-2.67 0-4.933-1.804-5.74-4.23H2.853v2.646A9.997 9.997 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.26 13.704A5.99 5.99 0 0 1 5.94 12c0-.592.108-1.165.32-1.704V7.65H2.853A10 10 0 0 0 2 12c0 1.61.385 3.136 1.067 4.349l3.193-2.645Z"
        fill="#FBBC04"
      />
      <path
        d="M12 6.067c1.5 0 2.846.516 3.906 1.53l2.93-2.93C17.07 3.022 14.754 2 12 2A9.997 9.997 0 0 0 2.853 7.65l3.407 2.646c.807-2.426 3.07-4.23 5.74-4.23Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function MicrosoftIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M3 3h8.5v8.5H3z" fill="#F25022" />
      <path d="M12.5 3H21v8.5h-8.5z" fill="#7FBA00" />
      <path d="M3 12.5h8.5V21H3z" fill="#00A4EF" />
      <path d="M12.5 12.5H21V21h-8.5z" fill="#FFB900" />
    </svg>
  );
}
