import { motion, useReducedMotion } from "framer-motion";
import { useCvData } from "@/contexts/useCvData";
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
  const aboutPanelRef = useRef<HTMLDivElement | null>(null);
  const [aboutPanelHeight, setAboutPanelHeight] = useState(0);

  useEffect(() => {
    setCurrentPhotoUrl(resolvedPrimaryPhotoUrl);
  }, [resolvedPrimaryPhotoUrl]);

  useEffect(() => {
    const updateAboutPanelHeight = () => {
      const nextHeight = aboutPanelRef.current?.scrollHeight ?? 0;
      setAboutPanelHeight((current) => (current === nextHeight ? current : nextHeight));
    };

    updateAboutPanelHeight();
    window.addEventListener("resize", updateAboutPanelHeight);
    return () => window.removeEventListener("resize", updateAboutPanelHeight);
  }, [data.about.paragraphs]);

  const handleAboutToggle = () => {
    const measuredPanelHeight = aboutPanelRef.current?.scrollHeight ?? 0;
    if (measuredPanelHeight > 0 && measuredPanelHeight !== aboutPanelHeight) {
      setAboutPanelHeight(measuredPanelHeight);
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
    <section
      id="hero"
      className="hero-gradient min-h-screen flex items-center justify-center pt-14 md:pt-16 pb-6 md:pb-10"
    >
      <div className="section-container w-full flex flex-col items-center text-center">
        <div className="flex w-full flex-col items-center text-center md:flex-row md:items-center md:gap-10 md:text-left">
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

          <div className="w-full max-w-lg overflow-visible">
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
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] motion-medium active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto md:hover:-translate-y-0.5 md:hover:shadow-md"
              >
                View Experience
              </a>
              <a
                href="#contact"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary/40 px-5 text-sm font-medium text-foreground transition-[background-color,color,transform] motion-medium active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto md:hover:-translate-y-0.5 md:hover:bg-secondary/80"
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

            <div className="w-full mt-6">
              <motion.div
                initial={false}
                animate={{
                  opacity: aboutOpen ? 1 : 0,
                  maxHeight: aboutOpen ? aboutPanelHeight : 0,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 1.05, ease: "easeInOut" }
                }
                className="w-full origin-top overflow-hidden"
                id="hero-about-panel"
              >
                <div ref={aboutPanelRef}>
                  <div className="w-full rounded-xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm">
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
    </section>
  );
};

export default HeroSection;

