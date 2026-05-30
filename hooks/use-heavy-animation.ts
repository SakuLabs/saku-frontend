'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true only when expensive decorative animations (e.g. the full-screen
 * SVG turbulence/displacement filter in EtherealShadow) should run.
 *
 * Disabled when the user prefers reduced motion OR on small / coarse-pointer
 * devices (phones, tablets) where the continuous SVG filter repaint causes
 * jank and drains battery. Defaults to false until measured (SSR-safe).
 */
export function useHeavyAnimation(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const query = window.matchMedia(
      '(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
    );
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return enabled;
}
