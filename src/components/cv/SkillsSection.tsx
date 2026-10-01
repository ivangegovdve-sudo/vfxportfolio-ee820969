import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import "@/styles/credentials.css";

const SkillsSection = () => {
  const { data } = useCvData();

  return (
    <section id="skills" className="skills-section" data-sc-act="flow" aria-labelledby="skills-title">
      <div className="section-container">
        <AnimatedSection>
          <h2 id="skills-title" className="section-title">Skills</h2>
        </AnimatedSection>

        <div className="skills-sections">
          {data.skills.sections.map((section, sectionIndex) => (
            <AnimatedSection
              key={`${section.title}-${sectionIndex}`}
              className={`skill-section${sectionIndex === 0 ? " skill-section--featured" : ""}`}
            >
              <h3 className="skill-section-title">{section.title}</h3>
              <div className="skill-groups">
                {section.groups.map((group, groupIndex) => {
                  const isInline = group.skills.every((skill) => skill.length < 45);

                  return (
                    <div key={groupIndex} className="skill-group">
                      {group.category && <h4 className="skill-group-title">{group.category}</h4>}
                      {group.note && <p className="skill-group-note">{group.note}</p>}
                      <ul className={`skill-list${isInline ? " skill-list--inline" : ""}`}>
                        {group.skills.map((skill, skillIndex) => <li key={`${skill}-${skillIndex}`}>{skill}</li>)}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="skills-personal-languages">
          <AnimatedSection className="personal-skills">
            <h3 className="skill-section-title">Personal</h3>
            <ul className="skill-list">
              {data.skills.personal.map((skill, index) => <li key={`${skill}-${index}`}>{skill}</li>)}
            </ul>
          </AnimatedSection>

          <AnimatedSection className="languages">
            <h3 className="skill-section-title">Languages</h3>
            <ul className="language-list">
              {data.languages.map((language, index) => (
                <li key={`${language.language}-${index}`} className="language-entry">
                  <span className="language-name">{language.language}</span>
                  <span className="language-proficiency">{language.proficiency}</span>
                  <span
                    className="language-level"
                    role="img"
                    aria-label={`${language.language} proficiency level ${language.level} of 5`}
                  >
                    {Array.from({ length: 5 }, (_, levelIndex) => (
                      <span
                        key={levelIndex}
                        className={`language-level-block${levelIndex < language.level ? " language-level-block--filled" : ""}`}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
