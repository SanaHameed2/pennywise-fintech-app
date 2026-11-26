// src/components/StepHeading.tsx
// Heading that receives focus when a wizard step mounts, so keyboard and screen-reader users
// land on the new step instead of being left on a control that no longer exists.
import { useEffect, useRef } from 'react';

export function StepHeading({ children, focus, className = '' }: { children: React.ReactNode; focus: boolean; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus();
  }, [focus]);
  return (
    <h2 ref={ref} tabIndex={-1} className={`text-xl font-semibold text-white outline-none ${className}`}>
      {children}
    </h2>
  );
}
