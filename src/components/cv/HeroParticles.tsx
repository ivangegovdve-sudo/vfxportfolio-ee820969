/**
 * HeroParticles — lightweight CSS-only atmospheric dust motes.
 *
 * ▸ No canvas, no heavy libraries — pure DOM + CSS animations.
 * ▸ Pointer proximity increases motion speed & brightness.
 * ▸ Mobile renders fewer particles.
 * ▸ prefers-reduced-motion freezes all animation.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Particle generation ───────────────────────────────── */

interface Mote {
  id: number;
  /** % from left */
  x: number;
  /** % from top */
  y: number;
  /** px diameter */
  size: number;
  /** seconds per full float cycle */
  duration: number;
  /** negative delay to stagger start */
  delay: number;
  /** base opacity 0–1 */
  opacity: number;
  /** horizontal drift amplitude in px */
  driftX: number;
  /** vertical drift amplitude in px */
  driftY: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateMotes(count: number): Mote[] {
  const rng = seededRandom(42);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rng() * 100,
    y: rng() * 100,
    size: 2 + rng() * 3,
    duration: 14 + rng() * 18,
    delay: -(rng() * 20),
    opacity: 0.15 + rng() * 0.3,
    driftX: 8 + rng() * 20,
    driftY: 10 + rng() * 24,
  }));
}

/* ── Component ─────────────────────────────────────────── */

const HeroParticles = () => {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  const count = isMobile ? 10 : 22;
  const motes = useMemo(() => generateMotes(count), [count]);

  /* Pointer enter/leave on hero section */
  const handleEnter = useCallback(() => setHovering(true), []);
  const handleLeave = useCallback(() => setHovering(false), []);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    hero.addEventListener("pointerenter", handleEnter);
    hero.addEventListener("pointerleave", handleLeave);
    return () => {
      hero.removeEventListener("pointerenter", handleEnter);
      hero.removeEventListener("pointerleave", handleLeave);
    };
  }, [handleEnter, handleLeave]);

  if (reduceMotion) {
    /* Render static faint dots — no animation at all */
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      >
        {motes.slice(0, 6).map((m) => (
          <div
            key={m.id}
            className="absolute rounded-full"
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: m.size,
              height: m.size,
              opacity: m.opacity * 0.3,
              background: "hsl(var(--primary) / 0.5)",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      {motes.map((m) => (
        <div
          key={m.id}
          className="hero-mote absolute rounded-full"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            "--mote-opacity": m.opacity,
            "--mote-duration": `${m.duration}s`,
            "--mote-delay": `${m.delay}s`,
            "--mote-drift-x": `${m.driftX}px`,
            "--mote-drift-y": `${m.driftY}px`,
            animationPlayState: hovering ? "running" : "running",
            animationDuration: hovering
              ? `${m.duration * 0.55}s`
              : `${m.duration}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default HeroParticles;
