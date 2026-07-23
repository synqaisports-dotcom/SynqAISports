import type { ReactNode } from 'react';

export default function PlayLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060a12] text-cyan-100 antialiased">
      {children}
    </div>
  );
}
