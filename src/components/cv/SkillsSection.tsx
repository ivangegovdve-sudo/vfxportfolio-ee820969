import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";

const IS_TAG_THRESHOLD = 45; // skills shorter than this render as tags

const SkillsSection = () => {
  const { data } = useCvData();

  return (
    <section id="skills" className="section-spacing" aria-labelledby="skills-title">
      <div className="section-container">
        <AnimatedSection>
          <h2 id="skills-title" className="section-title">
            Skills
          </h2>
        </AnimatedSection>

        <div className="space-y-12">
          {/* Skill Sections */}
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
                            {group.skills.map((skill) => (
                              <span key={skill} className="tag">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <ul className="space-y-1.5">
                            {group.skills.map((skill) => (
                              <li
                                key={skill}
                                className="text-sm text-foreground/75 flex items-start gap-2"
                              >
                                <span className="text-primary mt-1.5 text-[6px]">{"\u2022"}</span>
                                {skill}
                              </li>
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
                  {data.skills.personal.map((skill) => (
                    <li
                      key={skill}
                      className="text-sm text-foreground/80 flex items-start gap-2"
                    >
                      <span className="text-primary mt-1.5 text-[6px]">{"\u2022"}</span>
                      {skill}
                    </li>
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

