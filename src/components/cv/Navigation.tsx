import { useEffect, useMemo, useRef, useState } from "react";
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

const Navigation = () => {
  const { data } = useCvData();
  const { activeSection, setActiveSection } = useActiveSection();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const renderCountRef = useRef(0);

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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showAvatar = activeSection !== "hero";
  const navItems = sectionNavItems;
  const navStateTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: MOTION_TOKENS.easingDefault };

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
        "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-colors motion-medium",
        scrolled ? "border-border bg-background/92 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-4xl items-center px-3 sm:px-5 md:h-14 md:px-8">
        <motion.ul layout className="flex w-full items-center justify-between gap-1 sm:gap-2">
          {navItems.map((navItem) => {
            const layoutTransition = reduceMotion
              ? { duration: 0 }
              : {
                  layout: {
                    duration: MOTION_TOKENS.durationMed,
                    ease: MOTION_TOKENS.easingDefault,
                  },
                };
            const isActive = activeSection === navItem.id;
            const showAvatarForHome = navItem.id === "hero" && showAvatar;

            return (
              <motion.li
                key={navItem.id}
                layout
                transition={layoutTransition}
                className="flex min-w-0 flex-1"
              >
                <motion.a
                  href={navItem.href}
                  aria-label={navItem.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActiveSection(navItem.id)}
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
                  <span className="flex flex-col items-center justify-center gap-0.5 md:flex-row md:gap-1.5">
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
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-indicator"
                      aria-hidden="true"
                      initial={reduceMotion ? false : { scaleX: 0.55 }}
                      animate={{ scaleX: 1 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              duration: 0.2,
                              ease: MOTION_TOKENS.easingDefault,
                            }
                      }
                      className="pointer-events-none absolute bottom-1.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary"
                      style={{ originX: 0.5 }}
                    />
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

