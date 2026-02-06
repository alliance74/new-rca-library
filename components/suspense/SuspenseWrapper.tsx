'use client';

import { Suspense, ReactNode } from 'react';

interface SuspenseWrapperProps {
  fallback: ReactNode;
  children: ReactNode;
}

export default function SuspenseWrapper({ fallback, children }: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}