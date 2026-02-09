import { useCvData } from "@/contexts/CVDataContext";
import AnimatedSection from "./AnimatedSection";
import { GraduationCap } from "lucide-react";

const EducationSection = () => {
  const { data } = useCvData();

  return (
    <section id="education" className="section-spacing bg-card" aria-labelledby="education-title">
      <div className="section-container">
        <AnimatedSection>
          <h2 id="education-title" className="section-title">
            Education
          </h2>
        </AnimatedSection>

        <div className="space-y-8">
          {data.education.map((edu, i) => (
            <AnimatedSection key={edu.id} delay={0.1 * (i + 1)}>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-foreground">
                    {edu.degree}
                  </h3>
                  <p className="text-sm font-medium text-primary">
                    {edu.institution}
                    {edu.location && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        · {edu.location}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {edu.startDate} — {edu.endDate}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-foreground/75 leading-relaxed mt-2">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
