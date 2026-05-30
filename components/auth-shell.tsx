/* Hallmark · macrostructure: Floating Glass Card · genre: atmospheric
 * tone: midnight-glass · anchor hue: indigo (~265) · studied: no
 * states: card reveal (fade+rise) — reduced-motion: collapses to opacity
 */
"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export function AuthShell({
  heading,
  subtitle,
  children,
  footer,
}: {
  heading: React.ReactNode;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10">
      {/* Static indigo gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-indigo-500/15 via-[#030712] to-[#030712]"
      />

      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
          {/* Logo — large, centered */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Saku"
              width={96}
              height={96}
              className="h-24 w-24 rounded-2xl"
              priority
            />
          </div>

          {/* Heading — primary; tight pairing with subtitle */}
          <div className="mb-7 space-y-2">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
              {heading}
            </h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          {/* Footer — set off by a hairline, generous separation from the form */}
          <div className="mt-7 border-t border-white/10 pt-5 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
