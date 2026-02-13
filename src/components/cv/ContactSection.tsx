import { useCvData } from "@/contexts/CVDataContext";
import AnimatedSection from "./AnimatedSection";
import { Mail, MapPin, ExternalLink } from "lucide-react";

const ContactSection = () => {
  const { data } = useCvData();
  const { email, location, links } = data.contact;

  return (
    <section id="contact" className="section-spacing" aria-labelledby="contact-title">
      <div className="section-container">
        <AnimatedSection>
          <h2 id="contact-title" className="section-title">
            Contact
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="max-w-lg">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Let's work together
            </h3>
            <p className="text-base text-foreground/75 mb-8">
              Available for freelance compositing, VFX, and animation projects.
              Feel free to reach out.
            </p>

            <div className="space-y-3 mb-8">
              <a
                href={`mailto:${email}`}
                className="group flex items-center gap-3 text-sm text-foreground transition-colors motion-short hover:text-primary"
              >
                <Mail className="w-4 h-4 text-primary" />
                <span className="group-hover:underline">{email}</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-foreground/75">
                <MapPin className="w-4 h-4 text-primary" />
                {location}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-[border-color,color,transform] motion-medium active:scale-[0.98] md:hover:-translate-y-0.5 md:hover:border-primary md:hover:text-primary"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ContactSection;
