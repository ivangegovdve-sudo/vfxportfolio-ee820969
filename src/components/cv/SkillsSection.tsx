import { ReactNode } from "react";
import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import SectionMarker from "./SectionMarker";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_REVEAL, MOTION_TOKENS } from "@/lib/motion";

const IS_TAG_THRESHOLD = 45;
const FEATURED_SECTION_TITLE = "Animation & VFX";

/** Gold proficiency bar — hairline track, gradient fill scaled by level */
const LanguageBar = ({
  language,
  proficiency,
  level,
  index,
}: {
  language: string;
  proficiency: string;
  level: number;
  index: number;
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-foreground">{language}</span>
        <span
          className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {proficiency}
        </span>
      </div>
      <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          layout={false}
          initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.9, delay: 0.15 + index * 0.1, ease: EASE_REVEAL }
          }
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${(level / 5) * 100}%`,
            transformOrigin: "left",
            background: "linear-gradient(to right, hsl(42 88% 42%), hsl(42 88% 60%))",
          }}
        />
      </div>
    </div>
  );
};

/** One editorial row — title in the left rail, content on the right */
const SkillRow = ({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: ReactNode;
  delay?: number;
}) => (
  <AnimatedSection delay={delay}>
    <div className="grid gap-4 border-t border-white/5 py-9 md:grid-cols-[220px_1fr] md:gap-10 md:py-10">
      <h3 className="font-display text-sm font-bold tracking-wide text-foreground/90">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  </AnimatedSection>
);

const SkillsSection = () => {
  const { data } = useCvData();
  const reduceMotion = useReducedMotion();

  const chipTransition = (index: number) =>
    reduceMotion
      ? { duration: 0 }
      : { duration: 0.28, delay: Math.min(index * 0.035, 0.42), ease: MOTION_TOKENS.easingDefault };

  const lineTransition = (index: number) =>
    reduceMotion
      ? { duration: 0 }
      : {
          duration: MOTION_TOKENS.durationSkillEntry,
          delay: index * 0.04,
          ease: MOTION_TOKENS.easingDefault,
        };

  return (
    <section id="skills" className="section-spacing" aria-labelledby="skills-title">
      <div className="section-container">
        <SectionMarker index="02" title="Skills" headingId="skills-title" />

        <div>
          {data.skills.sections.map((section, si) => {
            const isFeatured = section.title === FEATURED_SECTION_TITLE;
            return (
              <SkillRow key={section.title} title={section.title} delay={0.04 * si}>
                <div className="space-y-5">
                  {section.groups.map((group, gi) => {
                    const allShort = group.skills.every((s) => s.length < IS_TAG_THRESHOLD);
                    return (
                      <div key={`${section.title}-${gi}`}>
                        {group.category && (
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {group.category}
                          </p>
                        )}
                        {group.note && (
                          <p className="mb-2 text-xs italic text-muted-foreground">{group.note}</p>
                        )}
                        {allShort ? (
                          <div className="flex flex-wrap gap-2">
                            {group.skills.map((skill, skillIndex) => (
                              <motion.span
                                key={skill}
                                layout={false}
                                initial={
                                  reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }
                                }
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={chipTransition(skillIndex)}
                                className={
                                  isFeatured ? "tag px-4 py-1.5 text-sm font-semibold" : "tag"
                                }
                              >
                                {skill}
                              </motion.span>
                            ))}
                          </div>
                        ) : (
                          <ul className="space-y-2.5">
                            {group.skills.map((skill, skillIndex) => (
                              <motion.li
                                key={skill}
                                layout={false}
                                initial={
                                  reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }
                                }
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={lineTransition(skillIndex)}
                                className="flex items-baseline gap-3 text-sm leading-relaxed text-foreground/75"
                              >
                                <span
                                  aria-hidden="true"
                                  className="select-none text-[10px] text-primary/70"
                                  style={{ fontFamily: "var(--font-mono)" }}
                                >
                                  {"—"}
                                </span>
                                {skill}
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SkillRow>
            );
          })}

          {/* Personal — prose line with gold separators */}
          <SkillRow title="Personal" delay={0.05}>
            <p className="max-w-[62ch] text-sm leading-loose text-foreground/75">
              {data.skills.personal.map((skill, i) => (
                <span key={skill}>
                  {skill}
                  {i < data.skills.personal.length - 1 && (
                    <span aria-hidden="true" className="mx-2.5 text-primary/50">
                      {"·"}
                    </span>
                  )}
                </span>
              ))}
            </p>
          </SkillRow>

          {/* Languages — gold proficiency bars */}
          <SkillRow title="Languages" delay={0.08}>
            <div className="max-w-md space-y-6">
              {data.languages.map((lang, i) => (
                <LanguageBar
                  key={lang.language}
                  language={lang.language}
                  proficiency={lang.proficiency}
                  level={lang.level}
                  index={i}
                />
              ))}
            </div>
          </SkillRow>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
