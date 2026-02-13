import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCvData } from "@/contexts/CVDataContext";
import { User, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import fallbackHeroPhoto from "@/data/assets/slackPic.webp";
import { MOTION_TOKENS } from "@/lib/motion";
import { resolvePhotoUrl } from "@/utils/resolvePhotoUrl";

const FALLBACK_PHOTO_URL = "/placeholder.svg";

const HeroSection = () => {
  const { data } = useCvData();
  const { name, subtitle, photoUrl } = data.hero;
  const reduceMotion = useReducedMotion();
  const resolvedPrimaryPhotoUrl = useMemo(() => resolvePhotoUrl(photoUrl, fallbackHeroPhoto), [photoUrl]);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(resolvedPrimaryPhotoUrl);
  const [aboutOpen, setAboutOpen] = useState(false);
  const renderCountRef = useRef(0);

  renderCountRef.current += 1;

  useEffect(() => {
    setCurrentPhotoUrl(resolvedPrimaryPhotoUrl);
  }, [resolvedPrimaryPhotoUrl]);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    const probeStore = (window.__renderProbes ??= {});
    probeStore.HeroSection = renderCountRef.current;
  });

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
    <section id="hero" className="hero-gradient min-h-[66vh] md:min-h-[70vh] flex items-center pt-14 md:pt-16 pb-6 md:pb-10">
      <div className="section-container w-full">
        <div className="flex flex-col items-center gap-7 md:flex-row md:items-center md:gap-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: MOTION_TOKENS.durationAvatar, ease: MOTION_TOKENS.easingDefault }
            }
            className="shrink-0"
          >
            {currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                srcSet={`${currentPhotoUrl} 1x, ${currentPhotoUrl} 2x`}
                sizes="(max-width: 767px) 160px, 208px"
                alt={name}
                onError={handleImageError}
                loading="eager"
                decoding="async"
                width={208}
                height={208}
                className="w-40 h-40 md:w-52 md:h-52 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-secondary flex items-center justify-center border-4 border-primary/20 shadow-lg">
                <User className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground" />
              </div>
            )}
          </motion.div>

          <div className="overflow-visible text-center md:text-left">
            <motion.h1
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
              className="font-display text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.15]"
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
              className="mt-1.5 text-lg md:text-xl font-display font-medium text-primary"
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
              className="mt-1.5 max-w-lg text-base text-muted-foreground md:text-lg"
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
              className="mt-3.5 flex w-full flex-col justify-center gap-2.5 sm:flex-row sm:gap-3 md:mt-4 md:w-auto md:justify-start"
            >
              <a
                href="#experience"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] md:w-auto md:hover:-translate-y-0.5 md:hover:shadow-md"
              >
                View Experience
              </a>
              <a
                href="#contact"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary/40 px-5 text-sm font-medium text-foreground transition-[background-color,color,transform] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] md:w-auto md:hover:-translate-y-0.5 md:hover:bg-secondary/80"
              >
                Get in Touch
              </a>
              <button
                onClick={() => setAboutOpen(!aboutOpen)}
                className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium text-foreground/80 transition-[background-color,color,transform] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] md:w-auto md:hover:bg-secondary/70 md:hover:text-foreground"
                aria-expanded={aboutOpen}
                aria-controls="hero-about-panel"
              >
                ABOUT
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                    aboutOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </motion.div>

            <AnimatePresence>
              {aboutOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: MOTION_TOKENS.durationMed, ease: MOTION_TOKENS.easingDefault }
                  }
                  className="overflow-hidden"
                  id="hero-about-panel"
                >
                  <div className="mt-5 max-w-lg rounded-xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm">
                    <div className="space-y-3">
                      {data.about.paragraphs.map((p, i) => (
                        <p key={i} className="text-sm leading-relaxed text-foreground/80">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
