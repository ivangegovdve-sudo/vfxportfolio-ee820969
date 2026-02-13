import { useCvData } from "@/contexts/useCvData";
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
                <div className="mt-1 shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">{edu.degree}</h3>
                  <p className="text-sm font-medium text-primary">
                    {edu.institution}
                    {edu.location && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        {"\u00B7"} {edu.location}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {edu.startDate} {"\u2014"} {edu.endDate}
                  </p>
                  {edu.description && (
                    <p className="mt-2 text-sm leading-relaxed text-foreground/75">{edu.description}</p>
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

