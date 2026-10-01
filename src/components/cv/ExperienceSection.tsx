import { ExternalLink } from "lucide-react";
import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import TrademarkText from "./TrademarkText";
import "@/styles/credentials.css";

const ExperienceSection = () => {
  const { data } = useCvData();

  return (
    <section id="experience" className="experience-section" data-sc-act="flow" aria-labelledby="experience-title">
      <div className="section-container">
        <AnimatedSection>
          <h2 id="experience-title" className="section-title">Experience</h2>
        </AnimatedSection>

        <div className="experience-ledger">
          {data.experience.map((experience, index) => (
            <AnimatedSection key={experience.id}>
              <article className={`experience-entry${index === 0 ? " experience-entry--lead" : ""}`}>
                <div className="experience-context">
                  <p className="experience-company">{experience.company}</p>
                  <p className="experience-dates">
                    {experience.startDate} <span aria-hidden="true">—</span> {experience.endDate}
                  </p>
                  {experience.location && <p className="experience-location">{experience.location}</p>}
                </div>

                <div className="experience-detail">
                  <h3 className="experience-role">{experience.role}</h3>
                  <p className="experience-description">{experience.description}</p>

                  {!!experience.highlights?.length && (
                    <ul className="experience-highlights">
                      {experience.highlights.map((highlight, highlightIndex) => (
                        <li key={highlightIndex}><TrademarkText text={highlight} /></li>
                      ))}
                    </ul>
                  )}

                  {!!experience.tags?.length && (
                    <ul className="experience-tags" aria-label="Areas of work">
                      {experience.tags.map((tag, tagIndex) => <li key={`${tag}-${tagIndex}`}>{tag}</li>)}
                    </ul>
                  )}

                  {!!experience.links?.length && (
                    <div className="experience-links">
                      {experience.links.map((link, linkIndex) => (
                        <a key={`${link.label}-${linkIndex}`} href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.label}<ExternalLink size={14} aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
