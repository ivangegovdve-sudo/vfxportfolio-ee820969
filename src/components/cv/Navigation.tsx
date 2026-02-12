import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCvData } from "@/contexts/CVDataContext";
import { User } from "lucide-react";
import fallbackHeroPhoto from "@/data/assets/slackPic.png";
import { resolvePhotoUrl } from "@/utils/resolvePhotoUrl";

const navItems = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

const LAYOUT_EASE = [0.22, 1, 0.36, 1] as const;
const OVERSHOOT_EASE = [0.34, 1.2, 0.64, 1] as const;

const Navigation = () => {
  const { data } = useCvData();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);

  const avatarSrc = useMemo(
    () => resolvePhotoUrl(data.hero.photoUrl, fallbackHeroPhoto),
    [data.hero.photoUrl]
  );
  const [avatarCurrentSrc, setAvatarCurrentSrc] = useState(avatarSrc);

  useEffect(() => {
    setAvatarCurrentSrc(avatarSrc);
  }, [avatarSrc]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const heroElement = document.getElementById("hero");

    if (!heroElement) {
      const onScrollFallback = () => setShowAvatar(window.scrollY > window.innerHeight * 0.42);
      onScrollFallback();
      window.addEventListener("scroll", onScrollFallback, { passive: true });
      return () => window.removeEventListener("scroll", onScrollFallback);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setShowAvatar(!entries[0].isIntersecting);
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: "-56px 0px 0px 0px",
      }
    );

    observer.observe(heroElement);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      initial={reduceMotion ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.32, ease: LAYOUT_EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/92 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="section-container h-16 md:h-14 flex items-center">
        <motion.div
          layout
          transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: OVERSHOOT_EASE }}
          className="w-full flex items-center gap-2 sm:gap-3"
        >
          <AnimatePresence initial={false}>
            {showAvatar && (
              <motion.a
                href="#main"
                key="nav-avatar"
                aria-label="Scroll to top of portfolio"
                className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/90 shadow-sm overflow-hidden"
                initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.92 }}
                animate={
                  reduceMotion
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 1, y: [6, -1, 0], scale: [0.92, 1.04, 1] }
                }
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: LAYOUT_EASE }}
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
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
                  <User className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                )}
              </motion.a>
            )}
          </AnimatePresence>

          <motion.ul
            layout
            transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: OVERSHOOT_EASE }}
            className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0"
          >
            {navItems.map((item) => (
              <li key={item.href} className="flex-1 min-w-0">
                <a
                  href={item.href}
                  className="inline-flex h-11 md:h-10 w-full items-center justify-center px-3 sm:px-4 rounded-full text-[11px] sm:text-xs md:text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 whitespace-nowrap"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
