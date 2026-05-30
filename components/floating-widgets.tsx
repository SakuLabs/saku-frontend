'use client';

import dynamic from 'next/dynamic';

// Floating chat + assistant are overlay widgets, not needed for first paint.
// Lazy-load them (no SSR) so framer-motion / socket.io / markdown stay out of
// the initial bundle and don't block mobile TTI.
const FloatingChat = dynamic(
  () => import('@/components/floating-chat').then((m) => m.FloatingChat),
  { ssr: false }
);
const FloatingAssistant = dynamic(
  () => import('@/components/floating-assistant').then((m) => m.FloatingAssistant),
  { ssr: false }
);

export function FloatingWidgets() {
  return (
    <>
      <FloatingChat />
      <FloatingAssistant />
    </>
  );
}
