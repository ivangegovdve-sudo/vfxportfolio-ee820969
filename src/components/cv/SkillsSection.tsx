import { useCvData } from "@/contexts/CVDataContext";
import AnimatedSection from "./AnimatedSection";

const SkillsSection = () => {
  const { data } = useCvData();

  return (
    <section id="skills" className="section-spacing">
      <div className="section-container">
        <AnimatedSection>
          <p className="section-title">Skills</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Technical */}
          <div className="space-y-6">
            <AnimatedSection>
              <h3 className="font-display font-semibold text-base text-foreground mb-4">
                Technical
              </h3>
            </AnimatedSection>
            {data.skills.technical.map((cat, i) => (
              <AnimatedSection key={cat.category} delay={0.08 * (i + 1)}>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    {cat.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <span key={skill} className="tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Personal + Languages */}
          <div className="space-y-6">
            <AnimatedSection>
              <h3 className="font-display font-semibold text-base text-foreground mb-4">
                Personal
              </h3>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="flex flex-wrap gap-2">
                {data.skills.personal.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block px-3 py-1.5 text-xs font-medium rounded-full border border-border text-foreground/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </AnimatedSection>

            {/* Languages inline */}
            <AnimatedSection delay={0.2}>
              <h3 className="font-display font-semibold text-base text-foreground mb-4 mt-8">
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
                            i < lang.level
                              ? "bg-primary"
                              : "bg-border"
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
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
