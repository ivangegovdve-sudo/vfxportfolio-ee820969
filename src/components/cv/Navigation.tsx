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
const NAV_SCROLL_PROGRESS_RANGE_PX = 120;
const NAV_SCROLL_PROGRESS_LERP = 0.12;
const NAV_ICON_SPREAD_END_PROGRESS = 0.6;
const NAV_ICON_SPREAD_MAX_RATIO = 0.22;
const NAV_HOME_EMERGE_START = 0.25;
const NAV_HOME_EMERGE_OVERSHOOT = 0.65;
const NAV_HOME_EMERGE_SETTLE = 0.85;
const NAV_HOME_START_SCALE = 0.2;
const NAV_HOME_PRESETTLE_SCALE = 3.2;
const NAV_HOME_OVERSHOOT_SCALE = 3.4;
const NAV_HOME_START_Y = 10;

type NavMetrics = {
  startScroll: number;
  endScroll: number;
  homeCenterShiftPx: number;
  itemWidths: number[];
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  if (inMax === inMin) {
    return outMin;
  }
  const t = clamp01((value - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * t;
};

const getHomeScale = (progress: number) => {
  if (progress <= NAV_HOME_EMERGE_START) {
    return NAV_HOME_START_SCALE;
  }
  if (progress <= NAV_HOME_EMERGE_OVERSHOOT) {
    return mapRange(
      progress,
      NAV_HOME_EMERGE_START,
      NAV_HOME_EMERGE_OVERSHOOT,
      NAV_HOME_START_SCALE,
      NAV_HOME_OVERSHOOT_SCALE
    );
  }
  if (progress <= NAV_HOME_EMERGE_SETTLE) {
    return mapRange(
      progress,
      NAV_HOME_EMERGE_OVERSHOOT,
      NAV_HOME_EMERGE_SETTLE,
      NAV_HOME_OVERSHOOT_SCALE,
      NAV_HOME_PRESETTLE_SCALE
    );
  }
  return mapRange(progress, NAV_HOME_EMERGE_SETTLE, 1, NAV_HOME_PRESETTLE_SCALE, 1);
};

const Navigation = () => {
  const { data } = useCvData();
  const { activeSection, setActiveSection } = useActiveSection();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navMetrics, setNavMetrics] = useState<NavMetrics>({
    startScroll: 0,
    endScroll: 1,
    homeCenterShiftPx: 0,
    itemWidths: [],
  });
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const renderCountRef = useRef(0);
  const progressRafRef = useRef<number | null>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
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
        Math.abs(current - resolvedProgress) < 0.0005 ? current : resolvedProgress
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
      const nextTarget = clamp01((scrollY - startScroll) / range);

      targetProgressRef.current = nextTarget;

      if (reduceMotion) {
        currentProgressRef.current = nextTarget;
        setScrollProgress(nextTarget);
        return;
      }

      queueProgressFrame();
    },
    [queueProgressFrame, reduceMotion]
  );

  const recomputeMetrics = useCallback(() => {
    const heroElement = document.getElementById("hero");
    const navElement = navRef.current;
    if (!heroElement || !navElement) {
      return;
    }

    const navRect = navElement.getBoundingClientRect();
    const heroRect = heroElement.getBoundingClientRect();
    const heroBottomDocument = heroRect.bottom + window.scrollY;
    const startScroll = heroBottomDocument - (navRect.top + NAV_SCROLL_PROGRESS_RANGE_PX);
    const endScroll = heroBottomDocument - navRect.top;
    const itemWidths = sectionNavItems.map(
      (_, index) => itemRefs.current[index]?.getBoundingClientRect().width ?? 44
    );
    const homeRect = itemRefs.current[0]?.getBoundingClientRect();
    const navCenter = navRect.left + navRect.width / 2;
    const homeCenter = homeRect ? homeRect.left + homeRect.width / 2 : navCenter;

    const nextMetrics: NavMetrics = {
      startScroll,
      endScroll,
      homeCenterShiftPx: navCenter - homeCenter,
      itemWidths,
    };

    setNavMetrics(nextMetrics);
    metricsRef.current = nextMetrics;
    syncTargetProgress(window.scrollY || window.pageYOffset || 0);
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

    recomputeMetrics();
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (progressRafRef.current != null) {
        window.cancelAnimationFrame(progressRafRef.current);
        progressRafRef.current = null;
      }
    };
  }, [recomputeMetrics, syncTargetProgress]);

  const showAvatar = activeSection !== "hero";
  const navItems = sectionNavItems;
  const navStateTransition = reduceMotion
    ? { duration: 0 }
    : { duration: MOTION_TOKENS.durationShort, ease: MOTION_TOKENS.easingDefault };
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
        "fixed inset-x-0 top-0 z-50 overflow-x-hidden border-b border-transparent transition-colors motion-medium",
        scrolled ? "border-border bg-background/92 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
      ref={navRef}
    >
      <div className="mx-auto flex h-16 w-full max-w-4xl items-center px-3 sm:px-5 md:h-14 md:px-8">
        <motion.ul className="flex w-full items-center justify-between gap-1 sm:gap-2">
          {navItems.map((navItem, index) => {
            const isActive = activeSection === navItem.id;
            const showAvatarForHome = navItem.id === "hero" && showAvatar;
            const isHomeItem = navItem.id === "hero";
            const iconSpreadProgress = clamp01(scrollProgress / NAV_ICON_SPREAD_END_PROGRESS);
            const midpointIndex = (navItems.length - 1) / 2;
            const spreadDirection = index < midpointIndex ? -1 : 1;
            const spreadDistance =
              !isHomeItem && !reduceMotion
                ? (navMetrics.itemWidths[index] ?? 44) *
                  NAV_ICON_SPREAD_MAX_RATIO *
                  iconSpreadProgress *
                  spreadDirection
                : 0;
            const homeTranslateX =
              isHomeItem && !reduceMotion ? navMetrics.homeCenterShiftPx * scrollProgress : 0;
            const homeTranslateY =
              isHomeItem && !reduceMotion
                ? mapRange(scrollProgress, NAV_HOME_EMERGE_START, NAV_HOME_EMERGE_SETTLE, NAV_HOME_START_Y, 0)
                : 0;
            const homeOpacity =
              isHomeItem && !reduceMotion
                ? mapRange(scrollProgress, NAV_HOME_EMERGE_START, NAV_HOME_EMERGE_SETTLE, 0, 1)
                : 1;
            const homeScale = isHomeItem && !reduceMotion ? getHomeScale(scrollProgress) : 1;

            return (
              <motion.li
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
                  <motion.span
                    className="flex flex-col items-center justify-center gap-0.5 md:flex-row md:gap-1.5"
                    style={
                      isHomeItem
                        ? {
                            x: homeTranslateX,
                            y: homeTranslateY,
                            opacity: homeOpacity,
                            scale: homeScale,
                          }
                        : { x: spreadDistance }
                    }
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
                  </motion.span>
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
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </motion.nav>
  );
};

export default Navigation;

