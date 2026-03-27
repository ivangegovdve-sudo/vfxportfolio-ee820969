/**
 * Unified Motion Language
 * ─────────────────────────────────────────────────────────
 * Single source-of-truth for all timing, easing, spring,
 * reveal, hover, depth, and glow behaviour across the site.
 *
 * Rules:
 *  1. Every framer-motion transition references these tokens.
 *  2. CSS-only transitions use the mirrored custom-properties
 *     defined in index.css (--motion-*).
 *  3. Reduced-motion users get instant / zero-transform fallbacks
 *     via the `rm()` helper or `prefers-reduced-motion` media query.
 */

/* ── Easing ─────────────────────────────────────────────── */

/** Smooth deceleration — default for hover / micro-interactions */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Cinematic reveal — slightly faster attack, long settle */
export const EASE_REVEAL = [0.16, 1, 0.3, 1] as const;

/** Gentle symmetric — breathing, pulsing, looping */
export const EASE_GENTLE = [0.45, 0, 0.55, 1] as const;

/** Snappy interactive — press / tap feedback */
export const EASE_SNAP = [0.32, 0.72, 0, 1] as const;

/* ── Duration tiers (seconds) ───────────────────────────── */

export const DURATION = {
  /** Micro-feedback: press, toggle, icon swap */
  instant: 0.12,
  /** Hover / focus state changes */
  fast: 0.2,
  /** Standard transitions — nav, card hover, tooltip */
  normal: 0.35,
  /** Section reveal, card entrance */
  reveal: 0.75,
  /** Cinematic / hero-level entrance */
  cinematic: 1.0,
  /** Ambient loops (breathing, shimmer) */
  ambient: 6,
} as const;

/* ── Spring presets ─────────────────────────────────────── */

export const SPRING = {
  /** Snappy interactive — buttons, nav pills */
  snappy: { type: "spring" as const, stiffness: 380, damping: 30 },
  /** Smooth card hover / float */
  smooth: { type: "spring" as const, stiffness: 260, damping: 24, mass: 0.7 },
  /** Gentle settle — reveal overshoot */
  gentle: { type: "spring" as const, stiffness: 180, damping: 22, mass: 1 },
} as const;

/* ── Hover behaviour ────────────────────────────────────── */

export const HOVER = {
  /** Default card hover — slight lift */
  elevate: { y: -4 },
  /** Portfolio card — lift + scale */
  portfolio: { y: -4, scale: 1.025 },
  /** Poster card — cinematic lift */
  poster: { y: -10, scale: 1.04, rotateY: 0 },
  /** Press / tap feedback */
  press: { scale: 0.97 },
} as const;

export const HOVER_TRANSITION = {
  elevate: { duration: DURATION.normal, ease: EASE_OUT },
  portfolio: SPRING.smooth,
  poster: { duration: DURATION.normal, ease: EASE_OUT },
} as const;

/* ── Reveal presets (framer-motion variants) ─────────────
 *  Use:  variants={REVEAL.fade}  initial="hidden"  whileInView="visible"
 */

const revealTransition = (delay = 0) => ({
  duration: DURATION.reveal,
  delay,
  ease: EASE_REVEAL,
});

export const REVEAL = {
  /** Simple fade-up with blur */
  fade: {
    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: revealTransition(),
    },
  },

  /** Card entrance — fade-up + micro-scale */
  card: {
    hidden: { opacity: 0, y: 30, scale: 0.97, filter: "blur(6px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: revealTransition(i * 0.1),
    }),
  },

  /** Poster entrance — scale from small + fade */
  poster: {
    hidden: { opacity: 0, scale: 0.88, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.07,
        ease: EASE_REVEAL,
      },
    }),
  },

  /** Section block — clean fade */
  section: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.reveal, ease: EASE_REVEAL },
    },
  },
} as const;

/* ── Depth / shadow tokens ──────────────────────────────── */

export const SHADOW = {
  /** Resting card */
  rest: "0 2px 8px -2px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  /** Hovered card */
  hover: "0 16px 32px -8px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.06)",
  /** Premium poster hover */
  posterHover: "0 20px 40px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(251,191,36,0.15)",
  /** Poster rest */
  posterRest: "0 4px 12px -4px rgba(0,0,0,0.15)",
} as const;

/* ── Glow / highlight tokens ────────────────────────────── */

export const GLOW = {
  /** Primary radial glow overlay */
  primary: "radial-gradient(circle at 50% 80%, rgba(251,191,36,0.2), transparent 55%)",
  /** Elliptical card hover glow */
  card: "radial-gradient(ellipse at center, rgba(251,191,36,0.12), transparent 70%)",
  /** Accent bottom edge line */
  edgeLine: "linear-gradient(to right, transparent, hsl(38 92% 50% / 0.5), transparent)",
  /** Edge shine sweep */
  shineSweep: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, transparent 50%)",
} as const;

/* ── Reduced-motion helper ──────────────────────────────── */

/** Wrap any motion value — returns identity (no-motion) when reduced-motion is preferred. */
export function rm<T>(value: T, fallback: T): (reduceMotion: boolean | null) => T {
  return (reduceMotion) => (reduceMotion ? fallback : value);
}

/* ── Viewport defaults ──────────────────────────────────── */

export const VIEWPORT = {
  /** Standard reveal trigger */
  standard: { once: true, amount: 0.15 as const },
  /** Aggressive — poster rail, hero */
  eager: { once: true, amount: 0.1 as const },
} as const;

/* ── Legacy compatibility (re-export) ───────────────────── */

export const MOTION_TOKENS = {
  durationShort: DURATION.instant,
  durationMed: DURATION.fast,
  durationAvatar: DURATION.fast,
  durationSection: DURATION.normal,
  durationTimelineDot: 0.8,
  durationTimelineLine: 1.5,
  durationTimelineDotReveal: 0.56,
  durationTimelineLineReveal: 0.75,
  durationTimelineLineDelay: 0.08,
  durationSkillEntry: 0.24,
  durationPortfolioEntry: DURATION.reveal,
  easingDefault: EASE_OUT,
  easingReveal: EASE_REVEAL,
  hoverElevate: HOVER.elevate.y,
  portfolioHoverScale: HOVER.portfolio.scale,
  portfolioHoverSpring: SPRING.smooth,
  pressScale: HOVER.press.scale,
} as const;
