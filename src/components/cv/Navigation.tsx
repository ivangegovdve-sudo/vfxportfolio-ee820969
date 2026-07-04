import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
};

const sectionNavItems: SectionNavItem[] = [
  { id: "portfolio", href: "#portfolio", label: "Work" },
  { id: "skills", href: "#skills", label: "Skills" },
  { id: "experience", href: "#experience", label: "Experience" },
  { id: "contact", href: "#contact", label: "Contact" },
];

const PROGRAMMATIC_SCROLL_EVENT = "cv:programmatic-scroll-start";

const Navigation = () => {
  const { data } = useCvData();
  const { activeSection, setActiveSection } = useActiveSection();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  const avatarSrc = useMemo(
    () => resolvePhotoUrl(data.hero.photoUrl, fallbackHeroPhoto),
    [data.hero.photoUrl]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const prevRoot = root.style.overflowX;
    const prevBody = body.style.overflowX;
    root.style.overflowX = "clip";
    body.style.overflowX = "clip";
    return () => {
      root.style.overflowX = prevRoot;
      body.style.overflowX = prevBody;
    };
  }, []);

  const handleNavClick = (navItem: SectionNavItem) => {
    window.dispatchEvent(new CustomEvent(PROGRAMMATIC_SCROLL_EVENT));
    setActiveSection(navItem.id);
  };

  const handleHomeClick = () => {
    window.dispatchEvent(new CustomEvent(PROGRAMMATIC_SCROLL_EVENT));
    setActiveSection("hero");
  };

  const navStateTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: MOTION_TOKENS.easingDefault };

  return (
    <motion.nav
      initial={reduceMotion ? false : { y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: MOTION_TOKENS.durationMed, ease: MOTION_TOKENS.easingDefault }
      }
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[border-color,background-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-white/5 bg-background/90 backdrop-blur-xl"
          : "bg-transparent"
      )}
      aria-label="Site navigation"
    >
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6 md:px-10">

        {/* Left — Name / Home link */}
        <a
          href="#hero"
          onClick={handleHomeClick}
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Return to top"
        >
          <AnimatePresence mode="wait" initial={false}>
            {activeSection !== "hero" ? (
              <motion.div
                key="avatar"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="h-7 w-7 overflow-hidden rounded-full border border-white/10"
              >
                <img
                  src={avatarSrc}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  loading="eager"
                  decoding="async"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <span
            className="font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground group-hover:text-foreground transition-colors duration-200"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Ivan Gegov
          </span>
        </a>

        {/* Right — Section links */}
        <ul className="flex items-center gap-1 md:gap-0.5">
          {sectionNavItems.map((navItem) => {
            const isActive = activeSection === navItem.id;
            return (
              <li key={navItem.id}>
                <a
                  href={navItem.href}
                  aria-label={navItem.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleNavClick(navItem)}
                  className={cn(
                    "relative flex items-center px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {navItem.label}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-indicator"
                      aria-hidden="true"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 350, damping: 28, mass: 0.9 }
                      }
                      className="pointer-events-none absolute bottom-0 left-0 right-0 mx-auto h-px w-full bg-primary"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
};

export default Navigation;
