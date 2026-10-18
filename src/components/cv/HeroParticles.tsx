/**
 * HeroParticles — lightweight CSS-only atmospheric dust motes.
 *
 * ▸ Pure DOM + CSS animations, no canvas.
 * ▸ Pointer hover gently increases liveliness via CSS transition.
 * ▸ Mobile renders fewer, smaller particles.
 * ▸ prefers-reduced-motion renders only a few static dots.
 */

import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Deterministic RNG ─────────────────────────────────── */

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/* ── Mote shape ────────────────────────────────────────── */

interface Mote {
  id: number;
  x: number;      // % from left
  y: number;      // % from top
  size: number;    // px
  duration: number; // seconds
  delay: number;   // negative offset
  opacity: number; // 0–1
  driftX: number;  // px amplitude
  driftY: number;  // px amplitude
}

function generateMotes(count: number): Mote[] {
  const rng = seededRandom(42);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    // Keep motes away from the centre band (30–70% x, 25–75% y)
    // to avoid competing with text / avatar
    x: rng() < 0.5 ? rng() * 25 : 75 + rng() * 25,
    y: rng() * 100,
    size: 2 + rng() * 2.5,
    duration: 20 + rng() * 16,
    delay: -(rng() * 24),
    opacity: 0.08 + rng() * 0.14,
    driftX: 6 + rng() * 10,
    driftY: 8 + rng() * 14,
  }));
}

/* ── Component ─────────────────────────────────────────── */

const DESKTOP_COUNT = 16;
const MOBILE_COUNT = 6;

const HeroParticles = () => {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  const count = isMobile ? MOBILE_COUNT : DESKTOP_COUNT;
  const motes = useMemo(() => generateMotes(count), [count]);

  /* Toggle a CSS class on the container for hover — lets CSS
     handle the timing transition smoothly without React re-renders. */
  useEffect(() => {
    const hero = document.getElementById("hero");
    const container = containerRef.current;
    if (!hero || !container) return;

    const onEnter = () => container.classList.add("hero-motes-active");
    const onLeave = () => container.classList.remove("hero-motes-active");

    hero.addEventListener("pointerenter", onEnter);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointerenter", onEnter);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  /* Reduced-motion: a handful of static, barely-visible dots */
  if (reduceMotion) {
    return (
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {motes.slice(0, 4).map((m) => (
          <div
            key={m.id}
            className="absolute rounded-full"
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: m.size,
              height: m.size,
              opacity: 0.06,
              background: "hsl(var(--primary) / 0.4)",
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
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default HeroParticles;
