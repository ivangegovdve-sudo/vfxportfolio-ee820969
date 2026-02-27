import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BriefcaseBusiness,
  Clapperboard,
  GraduationCap,
  House,
  Mail,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { useActiveSection } from "@/context/useActiveSection";
import { ActiveSectionId } from "@/context/activeSectionIds";
import { useCvData } from "@/contexts/useCvData";
import fallbackHeroPhoto from "@/data/assets/slackPic.webp";
import { MOTION_TOKENS } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { resolvePhotoUrl } from "@/utils/resolvePhotoUrl";
import {
  HERO_NAV_MORPH_ANCHOR_ID,
  HERO_NAV_MORPH_LAYOUT_EVENT,
  HERO_NAV_MORPH_STATE_EVENT,
} from "@/lib/heroNavMorph";

type SectionNavItem = {
  id: ActiveSectionId;
  href: `#${ActiveSectionId}`;
  label: string;
  shortLabel: string;
  Icon: typeof House;
};

const sectionNavItems: SectionNavItem[] = [
  { id: "hero", href: "#hero", label: "Home", shortLabel: "Home", Icon: House },
  { id: "portfolio", href: "#portfolio", label: "Portfolio", shortLabel: "Work", Icon: Clapperboard },
  { id: "skills", href: "#skills", label: "Skills", shortLabel: "Skills", Icon: SlidersHorizontal },
  { id: "experience", href: "#experience", label: "Experience", shortLabel: "Exp", Icon: BriefcaseBusiness },
  { id: "education", href: "#education", label: "Education", shortLabel: "Edu", Icon: GraduationCap },
  { id: "contact", href: "#contact", label: "Contact", shortLabel: "Contact", Icon: Mail },
];

const PROGRAMMATIC_SCROLL_START_EVENT = "cv:programmatic-scroll-start";
const NAV_SCROLL_PROGRESS_LERP = 0.12;
const NAV_ICON_SPREAD_END_PROGRESS = 0.6;
const NAV_ICON_SPREAD_MAX_RATIO = 0.22;
const NAV_MORPH_START_VIEWPORT_RATIO = 0.25;
const NAV_MORPH_RETURN_HOLD_THRESHOLD = 0.1;
const NAV_MORPH_PROGRESS_EPSILON = 0.0005;
const NAV_HOME_FINAL_SIZE_BOOST = 1.08;
const NAV_RETURN_OVERSHOOT = 1.22;

type NavMetrics = {
  startScroll: number;
  endScroll: number;
  itemWidths: number[];
  morphStartX: number;
  morphStartY: number;
  morphStartSize: number;
  morphEndX: number;
  morphEndY: number;
  morphEndSize: number;
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  if (inMax === inMin) {
    return outMin;
  }
  const t = clamp01((value - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * t;
};

const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

const easeOutBack = (t: number, overshoot = 1.08) => {
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const Navigation = () => {
  const { data } = useCvData();
  const { activeSection, setActiveSection } = useActiveSection();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [rawProgress, setRawProgress] = useState(0);
  const [navMetrics, setNavMetrics] = useState<NavMetrics>({
    startScroll: 0,
    endScroll: 1,
    itemWidths: [],
    morphStartX: 0,
    morphStartY: 0,
    morphStartSize: 160,
    morphEndX: 0,
    morphEndY: 0,
    morphEndSize: 40,
  });
  const navRef = useRef<HTMLElement | null>(null);
  const homeMorphTargetRef = useRef<HTMLSpanElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const renderCountRef = useRef(0);
  const progressRafRef = useRef<number | null>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const rawTargetProgressRef = useRef(0);
  const isReturnPhaseRef = useRef(false);
  const metricsRef = useRef<NavMetrics>(navMetrics);

  const avatarSrc = useMemo(
    () => resolvePhotoUrl(data.hero.photoUrl, fallbackHeroPhoto),
    [data.hero.photoUrl]
  );
  const [avatarCurrentSrc, setAvatarCurrentSrc] = useState(avatarSrc);

  useEffect(() => {
    setAvatarCurrentSrc(avatarSrc);
  }, [avatarSrc]);

  renderCountRef.current += 1;

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    const probeStore = (window.__renderProbes ??= {});
    probeStore.Navigation = renderCountRef.current;
  });

  useEffect(() => {
    metricsRef.current = navMetrics;
  }, [navMetrics]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflowX = root.style.overflowX;
    const previousBodyOverflowX = body.style.overflowX;

    root.style.overflowX = "clip";
    body.style.overflowX = "clip";

    return () => {
      root.style.overflowX = previousRootOverflowX;
      body.style.overflowX = previousBodyOverflowX;
    };
  }, []);

  const mapDirectionalTarget = useCallback((nextRawTarget: number, movingUp: boolean) => {
    if (!movingUp) {
      return nextRawTarget;
    }

    if (nextRawTarget >= NAV_MORPH_RETURN_HOLD_THRESHOLD) {
      return 1;
    }

    const finalPhaseProgress = clamp01(1 - nextRawTarget / NAV_MORPH_RETURN_HOLD_THRESHOLD);
    const acceleratedPhase = Math.pow(finalPhaseProgress, 1.35);
    const baseReturn = 1 - easeOutBack(acceleratedPhase, NAV_RETURN_OVERSHOOT);

    if (finalPhaseProgress <= 0.62) {
      return baseReturn;
    }

    const overshootPhase = clamp01((finalPhaseProgress - 0.62) / 0.38);
    const overshootEnvelope = Math.sin(Math.PI * overshootPhase);
    return baseReturn - overshootEnvelope * 0.032;
  }, []);

  const queueProgressFrame = useCallback(() => {
    if (progressRafRef.current != null || reduceMotion) {
      return;
    }

    const run = () => {
      const target = targetProgressRef.current;
      const next = currentProgressRef.current + (target - currentProgressRef.current) * NAV_SCROLL_PROGRESS_LERP;
      const settled = Math.abs(target - next) < 0.001;
      const resolvedProgress = settled ? target : next;

      currentProgressRef.current = resolvedProgress;
      setScrollProgress((current) =>
        Math.abs(current - resolvedProgress) < NAV_MORPH_PROGRESS_EPSILON ? current : resolvedProgress
      );

      if (settled) {
        progressRafRef.current = null;
        return;
      }

      progressRafRef.current = window.requestAnimationFrame(run);
    };

    progressRafRef.current = window.requestAnimationFrame(run);
  }, [reduceMotion]);

  const syncTargetProgress = useCallback(
    (scrollY: number) => {
      const { startScroll, endScroll } = metricsRef.current;
      const range = Math.max(endScroll - startScroll, 1);
      const nextRawTarget = clamp01((scrollY - startScroll) / range);
      const previousRawTarget = rawTargetProgressRef.current;
      const movingUp = nextRawTarget < previousRawTarget - 0.0001;
      const nextDirectionalTarget = mapDirectionalTarget(nextRawTarget, movingUp);

      rawTargetProgressRef.current = nextRawTarget;
      targetProgressRef.current = nextDirectionalTarget;
      isReturnPhaseRef.current = movingUp && nextRawTarget < NAV_MORPH_RETURN_HOLD_THRESHOLD;
      setRawProgress((current) =>
        Math.abs(current - nextRawTarget) < NAV_MORPH_PROGRESS_EPSILON ? current : nextRawTarget
      );

      if (reduceMotion) {
        currentProgressRef.current = nextRawTarget;
        setScrollProgress(nextRawTarget);
        return;
      }

      queueProgressFrame();
    },
    [mapDirectionalTarget, queueProgressFrame, reduceMotion]
  );

  const recomputeMetrics = useCallback(() => {
    const heroMorphAnchor = document.getElementById(HERO_NAV_MORPH_ANCHOR_ID);
    const nextSection = document.getElementById("portfolio");
    const homeMorphTarget = homeMorphTargetRef.current;

    if (!heroMorphAnchor || !nextSection || !homeMorphTarget) {
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const scrollX = window.scrollX || window.pageXOffset || 0;
    const viewportHeight = Math.max(window.innerHeight || 0, 1);

    const heroRect = heroMorphAnchor.getBoundingClientRect();
    const nextSectionRect = nextSection.getBoundingClientRect();
    const homeMorphTargetRect = homeMorphTarget.getBoundingClientRect();
    const heroTopDocument = heroRect.top + scrollY;
    const heroCenterXDocument = heroRect.left + scrollX + heroRect.width / 2;
    const heroCenterYDocument = heroRect.top + scrollY + heroRect.height / 2;
    const startScroll = heroTopDocument - viewportHeight * NAV_MORPH_START_VIEWPORT_RATIO;
    const endScroll = Math.max(nextSectionRect.top + scrollY, startScroll + 1);
    const itemWidths = sectionNavItems.map(
      (_, index) => itemRefs.current[index]?.getBoundingClientRect().width ?? 44
    );

    const nextMetrics: NavMetrics = {
      startScroll,
      endScroll,
      itemWidths,
      morphStartX: heroCenterXDocument - scrollX,
      morphStartY: heroCenterYDocument - startScroll,
      morphStartSize: Math.max(heroRect.width, heroRect.height, 1),
      morphEndX: homeMorphTargetRect.left + homeMorphTargetRect.width / 2,
      morphEndY: homeMorphTargetRect.top + homeMorphTargetRect.height / 2,
      morphEndSize:
        Math.max(homeMorphTargetRect.width, homeMorphTargetRect.height, 1) * NAV_HOME_FINAL_SIZE_BOOST,
    };

    setNavMetrics(nextMetrics);
    metricsRef.current = nextMetrics;
    syncTargetProgress(scrollY);
  }, [syncTargetProgress]);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      setScrolled(scrollY > 12);
      syncTargetProgress(scrollY);
    };

    const onResize = () => {
      recomputeMetrics();
    };

    const onMorphLayout = () => {
      recomputeMetrics();
    };

    recomputeMetrics();
    onScroll();

    const settleTimer = window.setTimeout(recomputeMetrics, 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener(HERO_NAV_MORPH_LAYOUT_EVENT, onMorphLayout as EventListener);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener(HERO_NAV_MORPH_LAYOUT_EVENT, onMorphLayout as EventListener);
      if (progressRafRef.current != null) {
        window.cancelAnimationFrame(progressRafRef.current);
        progressRafRef.current = null;
      }
    };
  }, [recomputeMetrics, syncTargetProgress]);

  const morphVisible =
    !reduceMotion &&
    (rawProgress > NAV_MORPH_PROGRESS_EPSILON ||
      Math.abs(scrollProgress) > NAV_MORPH_PROGRESS_EPSILON);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(HERO_NAV_MORPH_STATE_EVENT, {
        detail: {
          active: morphVisible,
          rawProgress,
          visualProgress: scrollProgress,
        },
      })
    );
  }, [morphVisible, rawProgress, scrollProgress]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent(HERO_NAV_MORPH_STATE_EVENT, {
          detail: {
            active: false,
            rawProgress: 0,
            visualProgress: 0,
          },
        })
      );
    };
  }, []);

  const getReturnNudgeScale = (currentRawProgress: number) => {
    if (!isReturnPhaseRef.current) {
      return 1;
    }

    const finalPhaseProgress = clamp01(1 - currentRawProgress / NAV_MORPH_RETURN_HOLD_THRESHOLD);

    if (finalPhaseProgress <= 0.2) {
      return mapRange(finalPhaseProgress, 0, 0.2, 1, 0.93);
    }
    if (finalPhaseProgress <= 0.5) {
      return mapRange(finalPhaseProgress, 0.2, 0.5, 0.93, 1);
    }
    if (finalPhaseProgress <= 0.85) {
      return mapRange(finalPhaseProgress, 0.5, 0.85, 1, 1.03);
    }
    return mapRange(finalPhaseProgress, 0.85, 1, 1.03, 1);
  };

  const showAvatar = activeSection !== "hero";
  const navItems = sectionNavItems;
  const navStateTransition = reduceMotion
    ? { duration: 0 }
    : { duration: MOTION_TOKENS.durationShort, ease: MOTION_TOKENS.easingDefault };
  const iconSpreadProgress = clamp01(Math.max(scrollProgress, 0) / NAV_ICON_SPREAD_END_PROGRESS);
  const morphTravelProgress = scrollProgress;
  const morphTravelProgressClamped = clamp01(morphTravelProgress);
  const morphCenterX = lerp(navMetrics.morphStartX, navMetrics.morphEndX, morphTravelProgress);
  const morphCenterY = lerp(navMetrics.morphStartY, navMetrics.morphEndY, morphTravelProgress);
  const morphScaleTarget = navMetrics.morphEndSize / Math.max(navMetrics.morphStartSize, 1);
  const morphScale =
    lerp(1, morphScaleTarget, morphTravelProgressClamped) * getReturnNudgeScale(rawProgress);
  const morphPlateProgress = mapRange(morphTravelProgressClamped, 0.84, 1, 0, 1);
  const morphAccentProgress = mapRange(morphTravelProgressClamped, 0.9, 1, 0, 1);

  const handleNavItemClick = (sectionId: ActiveSectionId) => {
    setActiveSection(sectionId);
    window.dispatchEvent(new CustomEvent(PROGRAMMATIC_SCROLL_START_EVENT));
  };

  return (
    <motion.nav
      initial={reduceMotion ? false : { y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: MOTION_TOKENS.durationMed, ease: MOTION_TOKENS.easingDefault }
      }
      className={cn(
        "fixed inset-x-0 top-0 z-50 overflow-hidden border-b border-transparent transition-colors motion-medium",
        scrolled ? "border-border bg-background/92 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
      style={{ contain: "paint", willChange: "transform" }}
      ref={navRef}
    >
      <div className="mx-auto flex h-16 w-full max-w-4xl items-center px-3 sm:px-5 md:h-14 md:px-8">
        <ul className="relative flex w-full items-center justify-between gap-1 overflow-hidden sm:gap-2">
          {navItems.map((navItem, index) => {
            const isActive = activeSection === navItem.id;
            const isHomeItem = navItem.id === "hero";
            const showAvatarForHome = isHomeItem && showAvatar && !morphVisible;
            const midpointIndex = (navItems.length - 1) / 2;
            const spreadDirection = index < midpointIndex ? -1 : 1;
            const spreadDistance =
              !isHomeItem && !reduceMotion
                ? (navMetrics.itemWidths[index] ?? 44) *
                  NAV_ICON_SPREAD_MAX_RATIO *
                  iconSpreadProgress *
                  spreadDirection
                : 0;

            return (
              <li
                key={navItem.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className="flex min-w-0 flex-1"
              >
                <motion.a
                  href={navItem.href}
                  aria-label={navItem.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleNavItemClick(navItem.id)}
                  animate={reduceMotion ? undefined : { scale: isActive ? 1.02 : 1 }}
                  transition={navStateTransition}
                  className={cn(
                    "relative inline-flex h-12 w-full min-w-[44px] items-center justify-center rounded-2xl border border-transparent px-1 text-muted-foreground transition-[background-color,color,box-shadow,transform] motion-medium active:bg-secondary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-11 md:rounded-full md:px-3",
                    isActive
                      ? "bg-secondary/90 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))]"
                      : "md:hover:bg-secondary/65 md:hover:text-foreground"
                  )}
                  whileTap={reduceMotion ? undefined : { scale: MOTION_TOKENS.pressScale }}
                >
                  {isHomeItem ? (
                    <span className="pointer-events-none absolute inset-0">
                      <span
                        ref={homeMorphTargetRef}
                        data-testid="home-morph-target"
                        className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full md:h-8 md:w-8"
                      />
                      <span
                        className={cn(
                          "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 transition-opacity md:flex-row md:gap-1.5",
                          morphVisible ? "opacity-0" : "opacity-100"
                        )}
                        style={{ willChange: "opacity, transform" }}
                      >
                        {showAvatarForHome ? (
                          <motion.span
                            initial={reduceMotion ? false : { opacity: 0, x: -4, scale: 0.98 }}
                            animate={
                              reduceMotion
                                ? { opacity: 1, x: 0, scale: 1 }
                                : { opacity: 1, x: 0, scale: [0.98, 1.03, 1] }
                            }
                            transition={
                              reduceMotion
                                ? { duration: 0 }
                                : {
                                    duration: MOTION_TOKENS.durationAvatar,
                                    ease: MOTION_TOKENS.easingDefault,
                                    times: [0, 0.65, 1],
                                  }
                            }
                            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/70 md:h-8 md:w-8"
                          >
                            {avatarCurrentSrc ? (
                              <img
                                src={avatarCurrentSrc}
                                alt=""
                                aria-hidden="true"
                                className="h-full w-full object-cover"
                                loading="eager"
                                decoding="async"
                                onError={() => setAvatarCurrentSrc(fallbackHeroPhoto)}
                              />
                            ) : (
                              <User className="h-[18px] w-[18px] text-muted-foreground" aria-hidden="true" />
                            )}
                          </motion.span>
                        ) : (
                          <navItem.Icon
                            className="h-[17px] w-[17px] shrink-0 md:h-4 md:w-4"
                            strokeWidth={1.9}
                            aria-hidden="true"
                          />
                        )}
                        <span
                          aria-hidden="true"
                          className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] md:inline"
                        >
                          {navItem.label}
                        </span>
                      </span>
                    </span>
                  ) : (
                    <motion.span
                      className="flex flex-col items-center justify-center gap-0.5 will-change-transform md:flex-row md:gap-1.5"
                      style={{ x: spreadDistance }}
                    >
                      <navItem.Icon
                        className="h-[17px] w-[17px] shrink-0 md:h-4 md:w-4"
                        strokeWidth={1.9}
                        aria-hidden="true"
                      />
                      <span
                        aria-hidden="true"
                        className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] md:inline"
                      >
                        {navItem.label}
                      </span>
                    </motion.span>
                  )}
                  {isActive && (
                    <>
                      <span className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center md:hidden">
                        <motion.span
                          aria-hidden="true"
                          initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : {
                                  duration: 0.24,
                                  ease: MOTION_TOKENS.easingDefault,
                                }
                          }
                          className="h-1.5 w-1.5 rounded-full bg-primary"
                        />
                      </span>
                      <motion.span
                        layoutId="active-nav-indicator"
                        layout="position"
                        aria-hidden="true"
                        initial={reduceMotion ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : {
                                duration: 0.24,
                                ease: MOTION_TOKENS.easingDefault,
                              }
                        }
                        className="pointer-events-none absolute bottom-1.5 left-1/2 hidden h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary md:block"
                        style={{ originX: 0.5 }}
                      />
                    </>
                  )}
                </motion.a>
              </li>
            );
          })}
        </ul>
      </div>
      {!reduceMotion && (
        <span
          aria-hidden="true"
          data-testid="hero-nav-morph-proxy"
          className="pointer-events-none fixed left-0 top-0 z-[70] will-change-transform"
          style={{
            opacity: morphVisible ? 1 : 0,
            transform: `translate3d(${morphCenterX - navMetrics.morphStartSize / 2}px, ${
              morphCenterY - navMetrics.morphStartSize / 2
            }px, 0) scale(${morphScale})`,
            transformOrigin: "top left",
          }}
        >
          <span
            className="relative block overflow-hidden rounded-full border-4 border-primary/20 shadow-lg will-change-transform"
            style={{
              width: navMetrics.morphStartSize,
              height: navMetrics.morphStartSize,
            }}
          >
            {avatarCurrentSrc ? (
              <img
                src={avatarCurrentSrc}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
                onError={() => setAvatarCurrentSrc(fallbackHeroPhoto)}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-secondary">
                <User className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              </span>
            )}
            <span
              className="absolute inset-0 rounded-full bg-background/35"
              style={{ opacity: morphPlateProgress * 0.25 }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: "0 6px 14px rgba(15, 23, 42, 0.24)",
                opacity: morphPlateProgress * 0.85,
              }}
            />
            <span
              className="absolute inset-0 rounded-full border border-primary/40"
              style={{ opacity: morphAccentProgress * 0.6 }}
            />
          </span>
        </span>
      )}
    </motion.nav>
  );
};

export default Navigation;
