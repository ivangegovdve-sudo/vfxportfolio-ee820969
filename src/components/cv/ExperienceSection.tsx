import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import SectionMarker from "./SectionMarker";
import { ExternalLink } from "lucide-react";
import TrademarkText from "./TrademarkText";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MOTION_TOKENS } from "@/lib/motion";

const ACTIVE_ZONE_TOP_RATIO = 0.25;
const ACTIVE_ZONE_BOTTOM_RATIO = 0.75;

const ExperienceSection = () => {
  const { data } = useCvData();
  const reduceMotion = useReducedMotion();
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [revealedEntries, setRevealedEntries] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    entryRefs.current = entryRefs.current.slice(0, data.experience.length);

    if (reduceMotion) {
      setRevealedEntries(new Set(Array.from({ length: data.experience.length }, (_, index) => index)));
      return;
    }

    let rafId: number | null = null;

    const checkEntryCenters = () => {
      const bandTop = window.innerHeight * ACTIVE_ZONE_TOP_RATIO;
      const bandBottom = window.innerHeight * ACTIVE_ZONE_BOTTOM_RATIO;
      const nextIndexes: number[] = [];

      entryRefs.current.forEach((entry, index) => {
        if (!entry) {
          return;
        }

        const rect = entry.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        if (centerY >= bandTop && centerY <= bandBottom) {
          nextIndexes.push(index);
        }
      });

      if (nextIndexes.length === 0) {
        return;
      }

      setRevealedEntries((current) => {
        const next = new Set(current);
        let changed = false;

        nextIndexes.forEach((index) => {
          if (!next.has(index)) {
            next.add(index);
            changed = true;
          }
        });

        return changed ? next : current;
      });
    };

    const requestCheck = () => {
      if (rafId != null) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        checkEntryCenters();
      });
    };

    requestCheck();
    window.addEventListener("scroll", requestCheck, { passive: true });
    window.addEventListener("resize", requestCheck);

    return () => {
      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", requestCheck);
      window.removeEventListener("resize", requestCheck);
    };
  }, [data.experience.length, reduceMotion]);

  return (
    <section id="experience" className="section-spacing bg-card" aria-labelledby="experience-title">
      <div className="section-container">
        <SectionMarker index="03" title="Experience" headingId="experience-title" />

        <div className="space-y-0">
          {data.experience.map((exp, i) => {
            const isRevealed = reduceMotion || revealedEntries.has(i);
            const isLast = i === data.experience.length - 1;
            return (
              <AnimatedSection key={exp.id} delay={0.05 * i}>
                <div
                  ref={(entry) => {
                    entryRefs.current[i] = entry;
                  }}
                  className="group relative pl-8 pb-12 last:pb-0"
                >
                  <motion.div
                    initial={reduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
                    animate={isRevealed ? { scaleY: 1 } : { scaleY: 0 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            duration: MOTION_TOKENS.durationTimelineLineReveal,
                            delay: MOTION_TOKENS.durationTimelineLineDelay,
                            ease: MOTION_TOKENS.easingReveal,
                          }
                    }
                    style={{ transformOrigin: "top" }}
                    className="timeline-line"
                  />

                  <motion.div
                    className="absolute left-0 top-1.5"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={
                      isRevealed
                        ? { scale: 1, opacity: 1 }
                        : { scale: 0.5, opacity: 0 }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            duration: MOTION_TOKENS.durationTimelineDotReveal,
                            ease: MOTION_TOKENS.easingReveal,
                          }
                    }
                  >
                    <div className="timeline-dot" />
                  </motion.div>

                  <div className={isLast ? "" : "border-b border-white/5 pb-10"}>
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <h3 className="font-display text-xl font-bold leading-snug text-foreground">
                        {exp.role}
                      </h3>
                      <span
                        className="shrink-0 text-[11px] tracking-[0.08em] text-muted-foreground"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {exp.startDate} {"\u2014"} {exp.endDate}
                      </span>
                    </div>

                    <p className="mb-3 text-sm font-medium text-primary">
                      {exp.company}
                      {exp.location && (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          {"\u00B7"} {exp.location}
                        </span>
                      )}
                    </p>

                    <p className="mb-3 max-w-[68ch] text-sm leading-relaxed text-foreground/75">{exp.description}</p>

                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="mb-4 space-y-1.5">
                        {exp.highlights.map((h, j) => (
                          <li key={j} className="flex items-baseline gap-3 text-sm leading-relaxed text-foreground/70">
                            <span
                              aria-hidden="true"
                              className="select-none text-[10px] text-primary/70"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {"\u2014"}
                            </span>
                            <TrademarkText text={h} />
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {exp.tags?.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                      {exp.links?.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors motion-short hover:text-primary/80"
                        >
                          {link.label}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
