import { motion, useReducedMotion } from "framer-motion";
import { useCvData } from "@/contexts/useCvData";
import { User, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import fallbackHeroPhoto from "@/data/assets/slackPic.webp";
import { MOTION_TOKENS } from "@/lib/motion";
import { resolvePhotoUrl } from "@/utils/resolvePhotoUrl";
import HeroParticles from "./HeroParticles";

const FALLBACK_PHOTO_URL = "/placeholder.svg";

const HeroSection = () => {
  const { data } = useCvData();
  const { name, subtitle, photoUrl } = data.hero;
  const reduceMotion = useReducedMotion();
  const resolvedPrimaryPhotoUrl = useMemo(() => resolvePhotoUrl(photoUrl, fallbackHeroPhoto), [photoUrl]);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(resolvedPrimaryPhotoUrl);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutMeasureRef = useRef<HTMLDivElement | null>(null);
  const [aboutPx, setAboutPx] = useState(0);

  const measureAboutHeight = useCallback(() => {
    const nextHeight = aboutMeasureRef.current?.scrollHeight ?? 0;
    setAboutPx((current) => (current === nextHeight ? current : nextHeight));
  }, []);

  useEffect(() => {
    setCurrentPhotoUrl(resolvedPrimaryPhotoUrl);
  }, [resolvedPrimaryPhotoUrl]);

  useEffect(() => {
    measureAboutHeight();
  }, [data.about.paragraphs, measureAboutHeight]);

  useEffect(() => {
    if (!aboutOpen) {
      return;
    }

    measureAboutHeight();
    const node = aboutMeasureRef.current;
    if (!node || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => measureAboutHeight());
    observer.observe(node);
    window.addEventListener("resize", measureAboutHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureAboutHeight);
    };
  }, [aboutOpen, measureAboutHeight]);

  const handleAboutToggle = () => {
    const measuredPanelHeight = aboutMeasureRef.current?.scrollHeight ?? 0;
    if (measuredPanelHeight > 0 && measuredPanelHeight !== aboutPx) {
      setAboutPx(measuredPanelHeight);
    }

    setAboutOpen((current) => !current);
  };

  const handleImageError = () => {
    if (currentPhotoUrl !== fallbackHeroPhoto) {
      setCurrentPhotoUrl(fallbackHeroPhoto);
      return;
    }

    if (currentPhotoUrl !== FALLBACK_PHOTO_URL) {
      setCurrentPhotoUrl(FALLBACK_PHOTO_URL);
    }
  };

  return (
    <section id="hero" className="hero-gradient min-h-screen relative overflow-hidden" aria-labelledby="hero-heading">
      <HeroParticles />
      <div className="pointer-events-none absolute inset-4 z-[1] rounded-[2rem] border border-white/10 md:inset-8" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-8 top-24 z-[1] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-screen pt-16 pb-8 flex items-center justify-center pointer-events-none z-10 md:pt-20 md:pb-12">
        <div className="section-container w-full pointer-events-auto">
          <div className="hero-command-panel flex w-full flex-col items-center gap-8 text-center md:grid md:grid-cols-[minmax(12rem,17rem)_1fr] md:items-center md:gap-10 md:text-left">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: MOTION_TOKENS.durationAvatar, ease: MOTION_TOKENS.easingDefault }
              }
              className="hero-portrait-shell shrink-0"
            >
              {currentPhotoUrl ? (
                <img
                  src={currentPhotoUrl}
                  srcSet={`${currentPhotoUrl} 1x, ${currentPhotoUrl} 2x`}
                  sizes="(max-width: 767px) 160px, 208px"
                  alt={`Portrait of ${name}`}
                  onError={handleImageError}
                  loading="eager"
                  decoding="async"
                  width={208}
                  height={208}
                  className="hero-portrait-image w-40 h-40 md:w-52 md:h-52 rounded-full object-cover border border-primary/40 shadow-lg hero-breathe hero-avatar-depth"
                />
              ) : (
                <div className="hero-portrait-image w-40 h-40 md:w-52 md:h-52 rounded-full bg-secondary flex items-center justify-center border border-primary/40 shadow-lg">
                  <User className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground" />
                </div>
              )}
            </motion.div>

            <div className="relative w-full max-w-2xl overflow-visible">
              <motion.h1
                id="hero-heading"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: MOTION_TOKENS.durationMed,
                        delay: 0.03,
                        ease: MOTION_TOKENS.easingDefault,
                      }
                }
                className="hero-title font-display text-5xl font-bold text-foreground tracking-tight leading-[1.02] md:text-7xl"
              >
                {name}
              </motion.h1>
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: MOTION_TOKENS.durationMed,
                        delay: 0.07,
                        ease: MOTION_TOKENS.easingDefault,
                      }
                }
                className="mt-3 text-lg md:text-xl font-display font-medium text-primary"
              >
                {"Animation \u00B7 Compositing \u00B7 VFX"}
              </motion.p>
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: MOTION_TOKENS.durationMed,
                        delay: 0.11,
                        ease: MOTION_TOKENS.easingDefault,
                      }
                }
                className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg"
              >
                {subtitle}
              </motion.p>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: MOTION_TOKENS.durationMed,
                        delay: 0.15,
                        ease: MOTION_TOKENS.easingDefault,
                      }
                }
                className="mt-6 flex w-full flex-col justify-center gap-2.5 sm:flex-row sm:gap-3 md:w-auto md:justify-start"
              >
                <a
                  href="#experience"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-[background-color,box-shadow,transform] motion-medium active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto md:hover:-translate-y-0.5 md:hover:shadow-lg md:hover:shadow-primary/25"
                >
                  View Experience
                </a>
                <a
                  href="#contact"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-background/30 px-5 text-sm font-medium text-foreground backdrop-blur-md transition-[background-color,color,transform] motion-medium active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto md:hover:-translate-y-0.5 md:hover:bg-secondary/80"
                >
                  Get in Touch
                </a>
                <button
                  onClick={handleAboutToggle}
                  className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium text-foreground/80 transition-[background-color,color,transform] motion-medium active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto md:hover:bg-secondary/70 md:hover:text-foreground"
                  aria-expanded={aboutOpen}
                  aria-controls="hero-about-panel"
                >
                  ABOUT
                  <ChevronDown
                    className={`h-4 w-4 transition-transform motion-medium ${
                      aboutOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </motion.div>

              <motion.div
                initial={false}
                animate={{
                  opacity: aboutOpen ? 1 : 0,
                  maxHeight: aboutOpen ? aboutPx : 0,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 1.05, ease: "easeInOut" }
                }
                className="absolute left-0 right-0 top-full mt-6 w-full origin-top overflow-hidden"
                id="hero-about-panel"
              >
                <div ref={aboutMeasureRef} className="w-full md:max-w-[30rem]">
                  <div className="w-full rounded-xl border border-border/60 bg-card/90 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <div className="space-y-3">
                      {data.about.paragraphs.map((p, i) => (
                        <p key={i} className="text-sm leading-relaxed text-foreground/80">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="h-screen" />

      <div
        aria-hidden="true"
        className="overflow-hidden"
        style={{
          maxHeight: aboutOpen ? `${aboutPx}px` : "0px",
          transition: reduceMotion ? "none" : "max-height 1050ms ease-in-out",
        }}
      >
        <div style={{ height: `${aboutPx}px` }} />
      </div>
    </section>
  );
};

export default HeroSection;

