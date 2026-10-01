import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import "@/styles/credentials.css";

const EducationSection = () => {
  const { data } = useCvData();

  return (
    <section id="education" className="education-section" data-sc-act="flow" aria-labelledby="education-title">
      <div className="section-container">
        <AnimatedSection>
          <h2 id="education-title" className="section-title">Education</h2>
        </AnimatedSection>

        <div className="education-ledger">
          {data.education.map((education) => (
            <AnimatedSection key={education.id}>
              <article className="education-entry">
                <p className="education-dates">
                  {education.startDate} <span aria-hidden="true">—</span> {education.endDate}
                </p>
                <div className="education-detail">
                  <h3 className="education-degree">{education.degree}</h3>
                  <p className="education-institution">{education.institution}</p>
                  {education.location && <p className="education-location">{education.location}</p>}
                  {education.description && <p className="education-description">{education.description}</p>}
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
