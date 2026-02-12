import { motion, AnimatePresence } from "framer-motion";
import { useCvData } from "@/contexts/CVDataContext";
import { User, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const FALLBACK_PHOTO_URL = "/placeholder.svg";

const HeroSection = () => {
  const { data } = useCvData();
  const { name, subtitle, photoUrl } = data.hero;
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl || "");
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    setCurrentPhotoUrl(photoUrl || "");
  }, [photoUrl]);

  const handleImageError = () => {
    if (currentPhotoUrl !== FALLBACK_PHOTO_URL) {
      setCurrentPhotoUrl(FALLBACK_PHOTO_URL);
    }
  };

  return (
    <section className="hero-gradient min-h-[80vh] flex items-center pt-14">
      <div className="section-container w-full">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.2] pb-1"
            >
              {name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-3 text-lg md:text-xl font-display font-medium text-primary"
            >
              {"Animation \u00B7 Compositing \u00B7 VFX"}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 text-base md:text-lg text-muted-foreground max-w-lg"
            >
              {subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start"
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get in Touch
              </a>
              <a
                href="#experience"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
              >
                View Experience
              </a>
              <button
                onClick={() => setAboutOpen(!aboutOpen)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
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
