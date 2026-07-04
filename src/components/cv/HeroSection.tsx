import { motion, useReducedMotion } from "framer-motion";
import { useCvData } from "@/contexts/useCvData";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import fallbackHeroPhoto from "@/data/assets/slackPic.webp";
import { EASE_REVEAL, DURATION } from "@/lib/motion";
import { resolvePhotoUrl } from "@/utils/resolvePhotoUrl";
import HeroParticles from "./HeroParticles";

const FALLBACK_PHOTO_URL = "/placeholder.svg";

/* Word-by-word reveal for display text */
function WordReveal({ text, className, baseDelay = 0 }: { text: string; className?: string; baseDelay?: number }) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.22em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={reduceMotion ? false : { y: "105%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: DURATION.cinematic,
                    delay: baseDelay + i * 0.07,
                    ease: EASE_REVEAL,
                  }
            }
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

const HeroSection = () => {
  const { data } = useCvData();
  const { name, subtitle, photoUrl } = data.hero;
  const reduceMotion = useReducedMotion();

  const resolvedPrimaryPhotoUrl = useMemo(
    () => resolvePhotoUrl(photoUrl, fallbackHeroPhoto),
    [photoUrl]
  );
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(resolvedPrimaryPhotoUrl);

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

  const scrollToWork = () => {
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] bg-background overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Atmospheric particles — behind content */}
      <HeroParticles />

      {/* Ambient gradient — bottom center glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] blur-[120px] opacity-20"
        style={{ background: "radial-gradient(ellipse, hsl(42 88% 56%), transparent 70%)" }}
      />

      {/* Main layout — two panel split */}
      <div className="relative z-10 min-h-[100dvh] flex items-center pt-16">
        <div className="w-full max-w-5xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 md:gap-20 items-center">

            {/* LEFT — Text panel */}
            <div className="flex flex-col items-start order-2 md:order-1">

              {/* Eyebrow label */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: DURATION.normal, delay: 0.1, ease: EASE_REVEAL }}
                className="mb-6 flex items-center gap-3"
              >
                <span className="block w-8 h-px" style={{ background: "hsl(42 88% 56%)" }} aria-hidden="true" />
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Animation · Compositing · VFX
                </span>
              </motion.div>

              {/* Hero display name */}
              <h1
                id="hero-heading"
                className="font-display font-extrabold leading-[0.92] tracking-tight text-foreground mb-7"
                style={{ fontSize: "clamp(3.5rem, 8.5vw, 7rem)" }}
              >
                <WordReveal text={name} baseDelay={0.2} />
              </h1>

              {/* Subtitle */}
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: DURATION.reveal, delay: 0.55, ease: EASE_REVEAL }
                }
                className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-[46ch] mb-10"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {subtitle}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: DURATION.reveal, delay: 0.72, ease: EASE_REVEAL }
                }
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={scrollToWork}
                  className="btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  View Work
                </button>
                <button
                  onClick={scrollToContact}
                  className="btn-ghost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Get in Touch
                </button>
              </motion.div>

              {/* About bio — collapsed inline below CTAs */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: DURATION.reveal, delay: 0.9, ease: EASE_REVEAL }
                }
                className="mt-10 pt-8 border-t border-white/5 max-w-[50ch]"
              >
                {data.about.paragraphs.slice(0, 1).map((p, i) => (
                  <p
                    key={i}
                    className="text-sm text-muted-foreground leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {p}
                  </p>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — Portrait panel */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: DURATION.cinematic, delay: 0.15, ease: EASE_REVEAL }
              }
              className="relative order-1 md:order-2 flex justify-center md:justify-end"
            >
              {/* Outer glow ring */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full blur-[48px] opacity-25"
                style={{ background: "radial-gradient(circle, hsl(42 88% 56%), transparent 70%)", transform: "scale(1.2)" }}
              />

              {/* Photo container */}
              <div className="relative">
                {currentPhotoUrl ? (
                  <div className="relative hero-breathe hero-avatar-depth">
                    {/* Cinematic vignette overlay */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full pointer-events-none z-10"
                      style={{
                        background: "radial-gradient(circle at center, transparent 55%, hsl(220 13% 6% / 0.6) 100%)",
                        mixBlendMode: "multiply",
                      }}
                    />
                    <img
                      src={currentPhotoUrl}
                      alt={`Portrait of ${name}`}
                      onError={handleImageError}
                      loading="eager"
                      decoding="async"
                      width={340}
                      height={340}
                      className="w-52 h-52 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full object-cover border border-white/8"
                      style={{ boxShadow: "0 0 0 1px hsl(42 88% 56% / 0.15), 0 24px 64px -12px rgba(0,0,0,0.7)" }}
                    />
                    {/* Gold accent ring */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ boxShadow: "inset 0 0 0 1px hsl(42 88% 56% / 0.12)" }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-72 h-72 rounded-full bg-secondary border border-white/8 flex items-center justify-center"
                    style={{ boxShadow: "0 24px 64px -12px rgba(0,0,0,0.7)" }}
                  >
                    <span className="text-muted-foreground text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                      No photo
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 1, delay: 1.4, ease: EASE_REVEAL }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={reduceMotion ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10"
          style={{ background: "linear-gradient(to bottom, hsl(42 88% 56% / 0.6), transparent)" }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
