import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCvData } from "@/contexts/CVDataContext";
import { User, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import fallbackHeroPhoto from "@/data/assets/slackPic.png";
import { resolvePhotoUrl } from "@/utils/resolvePhotoUrl";

const FALLBACK_PHOTO_URL = "/placeholder.svg";

const HeroSection = () => {
  const { data } = useCvData();
  const { name, subtitle, photoUrl } = data.hero;
  const reduceMotion = useReducedMotion();
  const resolvedPrimaryPhotoUrl = useMemo(() => resolvePhotoUrl(photoUrl, fallbackHeroPhoto), [photoUrl]);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(resolvedPrimaryPhotoUrl);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    setCurrentPhotoUrl(resolvedPrimaryPhotoUrl);
  }, [resolvedPrimaryPhotoUrl]);

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
    <section id="hero" className="hero-gradient min-h-[72vh] md:min-h-[76vh] flex items-center pt-14 md:pt-16 pb-8 md:pb-14">
      <div className="section-container w-full">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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

          <div className="text-center md:text-left overflow-visible">
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.15]"
            >
              {name}
            </motion.h1>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.36, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 text-lg md:text-xl font-display font-medium text-primary"
            >
              {"Animation \u00B7 Compositing \u00B7 VFX"}
            </motion.p>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.36, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 text-base md:text-lg text-muted-foreground max-w-lg"
            >
              {subtitle}
            </motion.p>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.34, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 md:mt-5 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center md:justify-start w-full md:w-auto"
            >
              <a
                href="#experience"
                className="inline-flex h-11 items-center justify-center gap-2 w-full sm:w-auto px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
              >
                View Experience
              </a>
              <a
                href="#contact"
                className="inline-flex h-11 items-center justify-center gap-2 w-full sm:w-auto px-5 rounded-full border border-primary/40 text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Get in Touch
              </a>
              <button
                onClick={() => setAboutOpen(!aboutOpen)}
                className="inline-flex h-11 items-center justify-center gap-1.5 w-full sm:w-auto px-4 rounded-full text-foreground/80 text-sm font-medium hover:bg-secondary/70 hover:text-foreground transition-colors"
                aria-expanded={aboutOpen}
                aria-controls="hero-about-panel"
              >
                ABOUT
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`}
                />
              </button>
            </motion.div>

            <AnimatePresence>
              {aboutOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                  id="hero-about-panel"
                >
                  <div className="mt-6 p-5 rounded-xl bg-card/80 border border-border/60 backdrop-blur-sm max-w-lg">
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
