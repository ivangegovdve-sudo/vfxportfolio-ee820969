import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import SectionMarker from "./SectionMarker";

const EducationSection = () => {
  const { data } = useCvData();

  return (
    <section id="education" className="section-spacing" aria-labelledby="education-title">
      <div className="section-container">
        <SectionMarker index="04" title="Education" headingId="education-title" />

        <div>
          {data.education.map((edu, i) => (
            <AnimatedSection key={edu.id} delay={0.06 * (i + 1)}>
              <div className="grid gap-2 border-t border-white/5 py-8 md:grid-cols-[220px_1fr] md:gap-10">
                <span
                  className="text-[11px] leading-6 tracking-[0.08em] text-muted-foreground"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {edu.startDate} {"—"} {edu.endDate}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">{edu.degree}</h3>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {edu.institution}
                    {edu.location && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        {"·"} {edu.location}
                      </span>
                    )}
                  </p>
                  {edu.description && (
                    <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-foreground/75">
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
