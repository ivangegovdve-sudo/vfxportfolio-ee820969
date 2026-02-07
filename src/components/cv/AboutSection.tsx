import { useCvData } from "@/contexts/CVDataContext";
import AnimatedSection from "./AnimatedSection";

const AboutSection = () => {
  const { data } = useCvData();

  return (
    <section id="about" className="section-spacing">
      <div className="section-container">
        <AnimatedSection>
          <p className="section-title">About</p>
        </AnimatedSection>
        <div className="space-y-5">
          {data.about.paragraphs.map((p, i) => (
            <AnimatedSection key={i} delay={0.1 * (i + 1)}>
              <p className="text-base md:text-lg leading-relaxed text-foreground/85">
                {p}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
