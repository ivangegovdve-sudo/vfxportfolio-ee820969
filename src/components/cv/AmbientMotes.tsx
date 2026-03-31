/**
 * AmbientMotes — reusable CSS-only atmospheric dust particles.
 *
 * ▸ Configurable count, color, size, and intensity.
 * ▸ Optional gentle mouse-reactive parallax via CSS transforms.
 * ▸ Coherent with HeroParticles visual language.
 * ▸ prefers-reduced-motion renders static faint dots.
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
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
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  driftX: number;
  driftY: number;
  depth: number; // 0-1, used for parallax intensity
}

function generateMotes(count: number, seed: number): Mote[] {
  const rng = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rng() * 100,
    y: rng() * 100,
    size: 1.5 + rng() * 2,
    duration: 18 + rng() * 20,
    delay: -(rng() * 20),
    opacity: 0.06 + rng() * 0.1,
    driftX: 4 + rng() * 8,
    driftY: 6 + rng() * 10,
    depth: 0.3 + rng() * 0.7,
  }));
}

/* ── Props ─────────────────────────────────────────────── */

interface AmbientMotesProps {
  /** Number of motes on desktop (mobile gets ~40%) */
  count?: number;
  /** RNG seed for deterministic placement */
  seed?: number;
  /** CSS color for motes — use HSL var format */
  color?: string;
  /** Enable gentle mouse-reactive parallax */
  mouseReactive?: boolean;
  /** Max parallax offset in px */
  parallaxStrength?: number;
  /** Additional className */
  className?: string;
}

const AmbientMotes = ({
  count = 10,
  seed = 77,
  color = "hsl(var(--primary) / 0.3)",
  mouseReactive = true,
  parallaxStrength = 12,
  className = "",
}: AmbientMotesProps) => {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const effectiveCount = isMobile ? Math.max(3, Math.round(count * 0.4)) : count;
  const motes = useMemo(() => generateMotes(effectiveCount, seed), [effectiveCount, seed]);

  /* Mouse-reactive parallax — shifts mote layers based on pointer position */
  useEffect(() => {
    if (reduceMotion || !mouseReactive || isMobile) return;
    const container = containerRef.current;
    if (!container) return;

    const parent = container.closest("section, [data-red-tiger-sticky-wrapper]") as HTMLElement;
    if (!parent) return;

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = parent.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        container.style.setProperty("--parallax-x", `${nx * parallaxStrength}px`);
        container.style.setProperty("--parallax-y", `${ny * parallaxStrength}px`);
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(rafRef.current);
      container.style.setProperty("--parallax-x", "0px");
      container.style.setProperty("--parallax-y", "0px");
    };

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [reduceMotion, mouseReactive, isMobile, parallaxStrength]);

  /* Reduced-motion: static faint dots */
  if (reduceMotion) {
    return (
      <div aria-hidden="true" className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
        {motes.slice(0, 3).map((m) => (
          <div
            key={m.id}
            className="absolute rounded-full"
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: m.size,
              height: m.size,
              opacity: 0.04,
              background: color,
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
      className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      style={{
        "--parallax-x": "0px",
        "--parallax-y": "0px",
      } as React.CSSProperties}
    >
      {motes.map((m) => (
        <div
          key={m.id}
          className="ambient-mote absolute rounded-full"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            "--mote-color": color,
            "--mote-opacity": m.opacity,
            "--mote-duration": `${m.duration}s`,
            "--mote-delay": `${m.delay}s`,
            "--mote-drift-x": `${m.driftX}px`,
            "--mote-drift-y": `${m.driftY}px`,
            "--mote-depth": m.depth,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default AmbientMotes;
