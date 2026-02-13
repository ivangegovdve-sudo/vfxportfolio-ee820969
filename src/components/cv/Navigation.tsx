import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BriefcaseBusiness,
  Clapperboard,
  GraduationCap,
  Mail,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { useCvData } from "@/contexts/useCvData";
import fallbackHeroPhoto from "@/data/assets/slackPic.webp";
import { MOTION_TOKENS } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { resolvePhotoUrl } from "@/utils/resolvePhotoUrl";

type SectionNavItem = {
  id: "portfolio" | "skills" | "experience" | "education" | "contact";
  href: `#${"portfolio" | "skills" | "experience" | "education" | "contact"}`;
  label: string;
  shortLabel: string;
  Icon: typeof Clapperboard;
};

const sectionNavItems: SectionNavItem[] = [
  { id: "portfolio", href: "#portfolio", label: "Portfolio", shortLabel: "Work", Icon: Clapperboard },
  { id: "skills", href: "#skills", label: "Skills", shortLabel: "Skills", Icon: SlidersHorizontal },
  { id: "experience", href: "#experience", label: "Experience", shortLabel: "Exp", Icon: BriefcaseBusiness },
  { id: "education", href: "#education", label: "Education", shortLabel: "Edu", Icon: GraduationCap },
  { id: "contact", href: "#contact", label: "Contact", shortLabel: "Contact", Icon: Mail },
];

const Navigation = () => {
  const { data } = useCvData();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionNavItem["id"]>("portfolio");
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

  useEffect(() => {
    const heroElement = document.getElementById("hero");

    if (!heroElement) {
      const onScrollFallback = () => setHeroVisible(window.scrollY < window.innerHeight * 0.42);
      onScrollFallback();
      window.addEventListener("scroll", onScrollFallback, { passive: true });
      return () => window.removeEventListener("scroll", onScrollFallback);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setHeroVisible(entries[0].isIntersecting);
      },
      {
        root: null,
        threshold: 0.18,
        rootMargin: "-64px 0px 0px 0px",
      }
    );

    observer.observe(heroElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sections = sectionNavItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          const nextSection = visible[0].target.id as SectionNavItem["id"];
          setActiveSection(nextSection);
        }
      },
      {
        root: null,
        rootMargin: "-44% 0px -44% 0px",
        threshold: [0.18, 0.35, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const showAvatar = !heroVisible;
  const navItems = showAvatar ? ["avatar", ...sectionNavItems] : sectionNavItems;

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
        "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-colors duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        scrolled ? "border-border bg-background/92 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-4xl items-center px-3 sm:px-5 md:h-14 md:px-8">
        <motion.ul layout className="flex w-full items-center justify-between gap-1 sm:gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {navItems.map((item, index) => {
              const layoutTransition = reduceMotion
                ? { duration: 0 }
                : {
                    layout: {
                      duration: MOTION_TOKENS.durationMed,
                      ease: MOTION_TOKENS.easingDefault,
                    },
                  };

              if (item === "avatar") {
                return (
                  <motion.li
                    key="avatar"
                    layout
                    className="flex min-w-0 flex-1"
                    initial={reduceMotion ? false : { opacity: 0, x: -6, scale: 0.98 }}
                    animate={
                      reduceMotion
                        ? { opacity: 1, x: 0, scale: 1 }
                        : { opacity: 1, x: 0, scale: [0.98, 1.03, 1] }
                    }
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            x: -4,
                            scale: 0.98,
                            transition: {
                              duration: MOTION_TOKENS.durationShort,
                              ease: MOTION_TOKENS.easingDefault,
                            },
                          }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            layout: {
                              duration: MOTION_TOKENS.durationMed,
                              ease: MOTION_TOKENS.easingDefault,
                            },
                            duration: MOTION_TOKENS.durationAvatar,
                            ease: MOTION_TOKENS.easingDefault,
                            times: [0, 0.65, 1],
                          }
                    }
                  >
                    <motion.a
                      href="#hero"
                      aria-label="Home"
                      className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-border/70 bg-card/90 text-foreground shadow-sm transition-colors duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-11 md:rounded-full md:hover:bg-secondary/70"
                      whileTap={reduceMotion ? undefined : { scale: MOTION_TOKENS.pressScale }}
                    >
                      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/70 md:h-8 md:w-8">
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
                      </span>
                    </motion.a>
                  </motion.li>
                );
              }

              const isActive = activeSection === item.id;

              return (
                <motion.li
                  key={item.id}
                  layout
                  transition={layoutTransition}
                  className="flex min-w-0 flex-1"
                >
                  <motion.a
                    href={item.href}
                    aria-label={item.label}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "inline-flex h-12 w-full min-w-[44px] items-center justify-center rounded-2xl border border-transparent px-1 text-muted-foreground transition-[background-color,color,box-shadow,transform] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:bg-secondary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-11 md:rounded-full md:px-3",
                      isActive
                        ? "bg-secondary/90 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))]"
                        : "md:hover:bg-secondary/65 md:hover:text-foreground"
                    )}
                    whileTap={reduceMotion ? undefined : { scale: MOTION_TOKENS.pressScale }}
                  >
                      <span className="flex flex-col items-center justify-center gap-0.5 md:flex-row md:gap-1.5">
                        <item.Icon
                          className="h-[17px] w-[17px] shrink-0 md:h-4 md:w-4"
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />
                      <span
                        aria-hidden="true"
                        className="hidden"
                      >
                        {item.shortLabel}
                      </span>
                      <span
                        aria-hidden="true"
                        className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] md:inline"
                      >
                        {item.label}
                      </span>
                    </span>
                  </motion.a>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </motion.nav>
  );
};

export default Navigation;

