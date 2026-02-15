import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION_TOKENS } from "@/lib/motion";

const IS_TAG_THRESHOLD = 45;

const SkillsSection = () => {
  const { data } = useCvData();
  const reduceMotion = useReducedMotion();

  const getEntryTransition = (index: number) =>
    reduceMotion
      ? { duration: 0 }
      : {
          duration: MOTION_TOKENS.durationSkillEntry,
          delay: index * 0.03,
          ease: MOTION_TOKENS.easingDefault,
        };

  const getDotTransition = (index: number) =>
    reduceMotion
      ? { duration: 0 }
      : {
          duration: 0.3,
          delay: index * 0.03 + MOTION_TOKENS.durationSkillEntry,
          ease: MOTION_TOKENS.easingDefault,
        };

  return (
    <section id="skills" className="section-spacing" aria-labelledby="skills-title">
      <div className="section-container">
        <AnimatedSection>
          <h2 id="skills-title" className="section-title">
            Skills
          </h2>
        </AnimatedSection>

        <div className="space-y-12">
          {data.skills.sections.map((section, si) => (
            <AnimatedSection key={section.title} delay={0.08 * si}>
              <div>
                <h3 className="font-display font-semibold text-base text-foreground mb-5 pb-2 border-b border-border">
                  {section.title}
                </h3>
                <div className="space-y-5">
                  {section.groups.map((group, gi) => {
                    const allShort = group.skills.every((s) => s.length < IS_TAG_THRESHOLD);
                    return (
                      <div key={`${section.title}-${gi}`}>
                        {group.category && (
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                            {group.category}
                          </p>
                        )}
                        {group.note && (
                          <p className="text-xs italic text-muted-foreground mb-2">
                            {group.note}
                          </p>
                        )}
                        {allShort ? (
                          <div className="flex flex-wrap gap-2">
                            {group.skills.map((skill, skillIndex) => (
                              <motion.span
                                key={skill}
                                layout={false}
                                initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={
                                  reduceMotion
                                    ? { duration: 0 }
                                    : {
                                        duration: 0.28,
                                        delay: skillIndex * 0.04,
                                        ease: MOTION_TOKENS.easingDefault,
                                      }
                                }
                                className="tag"
                              >
                                {skill}
                              </motion.span>
                            ))}
                          </div>
                        ) : (
                          <ul className="space-y-1.5">
                            {group.skills.map((skill, skillIndex) => (
                              <motion.li
                                key={skill}
                                layout={false}
                                initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={getEntryTransition(skillIndex)}
                                className="text-sm text-foreground/75 flex items-start gap-2"
                              >
                                <motion.span
                                  aria-hidden="true"
                                  layout={false}
                                  initial={reduceMotion ? {} : { scale: 0.8 }}
                                  whileInView={reduceMotion ? {} : { scale: [0.8, 1.2, 1] }}
                                  viewport={{ once: true, amount: 0.2 }}
                                  transition={getDotTransition(skillIndex)}
                                  className="mt-[0.4rem] h-2 w-2 shrink-0 rounded-full bg-primary"
                                />
                                {skill}
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>
          ))}

          {/* Personal Skills + Languages side by side */}
          <div className="grid md:grid-cols-2 gap-10">
            {/* Personal */}
            <AnimatedSection delay={0.1}>
              <div>
                <h3 className="font-display font-semibold text-base text-foreground mb-5 pb-2 border-b border-border">
                  Personal
                </h3>
                <ul className="space-y-2">
                  {data.skills.personal.map((skill, skillIndex) => (
                    <motion.li
                      key={skill}
                      layout={false}
                      initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={getEntryTransition(skillIndex)}
                      className="text-sm text-foreground/80 flex items-start gap-2"
                    >
                      <motion.span
                        aria-hidden="true"
                        layout={false}
                        initial={reduceMotion ? {} : { scale: 0.8 }}
                        whileInView={reduceMotion ? {} : { scale: [0.8, 1.2, 1] }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={getDotTransition(skillIndex)}
                        className="mt-[0.4rem] h-2 w-2 shrink-0 rounded-full bg-primary"
                      />
                      {skill}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Languages */}
            <AnimatedSection delay={0.2}>
              <div>
                <h3 className="font-display font-semibold text-base text-foreground mb-5 pb-2 border-b border-border">
                  Languages
                </h3>
                <div className="space-y-3">
                  {data.languages.map((lang) => (
                    <div key={lang.language} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground w-24">
                        {lang.language}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${
                              i < lang.level ? "bg-primary" : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
