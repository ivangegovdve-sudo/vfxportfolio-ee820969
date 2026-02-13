import { useCvData } from "@/contexts/CVDataContext";
import AnimatedSection from "./AnimatedSection";
import { ExternalLink } from "lucide-react";
import TrademarkText from "./TrademarkText";

const ExperienceSection = () => {
  const { data } = useCvData();

  return (
    <section id="experience" className="section-spacing bg-card" aria-labelledby="experience-title">
      <div className="section-container">
        <AnimatedSection>
          <h2 id="experience-title" className="section-title">
            Experience
          </h2>
        </AnimatedSection>

        <div className="space-y-0">
          {data.experience.map((exp, i) => (
            <AnimatedSection key={exp.id} delay={0.05 * i}>
              <div className="group relative pl-8 pb-12 last:pb-0">
                <div className="absolute left-0 top-1.5">
                  <div className="timeline-dot transition-transform motion-short md:group-hover:scale-110" />
                  {i < data.experience.length - 1 && <div className="timeline-line" />}
                </div>

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
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
