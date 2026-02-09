import { useCvData } from "@/contexts/CVDataContext";
import AnimatedSection from "./AnimatedSection";
import { ExternalLink } from "lucide-react";

const ExperienceSection = () => {
  const { data } = useCvData();

  return (
    <section
      id="experience"
      className="section-spacing bg-card"
      aria-labelledby="experience-title"
    >
      <div className="section-container">
        <AnimatedSection>
          <h2 id="experience-title" className="section-title">
            Experience
          </h2>
        </AnimatedSection>

        <div className="space-y-0">
          {data.experience.map((exp, i) => (
            <AnimatedSection key={exp.id} delay={0.05 * i}>
              <div className="relative pl-8 pb-12 last:pb-0 group">
                {/* Timeline */}
                <div className="absolute left-0 top-1.5">
                  <div className="timeline-dot group-hover:scale-125 transition-transform" />
                  {i < data.experience.length - 1 && <div className="timeline-line" />}
                </div>

                {/* Content */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                    <h3 className="font-display font-semibold text-lg text-foreground">
                      {exp.role}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground tracking-wide">
                      {exp.startDate} — {exp.endDate}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-primary mb-2">
                    {exp.company}
                    {exp.location && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        · {exp.location}
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-foreground/75 leading-relaxed mb-3">
                    {exp.description}
                  </p>

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-1 mb-3">
                      {exp.highlights.map((h, j) => (
                        <li
                          key={j}
                          className="text-sm text-foreground/70 flex items-start gap-2"
                        >
                          <span className="text-primary mt-1.5 text-[6px]">●</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap gap-2 items-center">
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
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
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
