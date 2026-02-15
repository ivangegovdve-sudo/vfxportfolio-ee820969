import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import { ExternalLink } from "lucide-react";
import TrademarkText from "./TrademarkText";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
      const bandTop = window.innerHeight * 0.35;
      const bandBottom = window.innerHeight * 0.65;
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
        <AnimatedSection>
          <h2 id="experience-title" className="section-title">
            Experience
          </h2>
        </AnimatedSection>

        <div className="space-y-0">
          {data.experience.map((exp, i) => {
            const isRevealed = reduceMotion || revealedEntries.has(i);
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
                      : { duration: 2, delay: 0.4, ease: "easeInOut" }
                  }
                  style={{ transformOrigin: "top" }}
                  className="timeline-line"
                />

                <motion.div
                  className="absolute left-0 top-1.5"
                  initial={reduceMotion ? { scale: 1 } : { scale: 0.9 }}
                  animate={
                    isRevealed
                      ? reduceMotion
                        ? { scale: 1 }
                        : { scale: [0.9, 1.06, 1] }
                      : { scale: 0.9 }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.72,
                          ease: "easeOut",
                          times: [0, 0.65, 1],
                        }
                  }
                >
                  <div className="timeline-dot" />
                </motion.div>

                <div>
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="font-display text-lg font-semibold text-foreground">{exp.role}</h3>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">
                      {exp.startDate} {"\u2014"} {exp.endDate}
                    </span>
                  </div>

                  <p className="mb-2 text-sm font-medium text-primary">
                    {exp.company}
                    {exp.location && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        {"\u00B7"} {exp.location}
                      </span>
                    )}
                  </p>

                  <p className="mb-3 text-sm leading-relaxed text-foreground/75">{exp.description}</p>

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-foreground/70">
                          <span className="mt-1.5 text-[6px] text-primary">{"\u2022"}</span>
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

