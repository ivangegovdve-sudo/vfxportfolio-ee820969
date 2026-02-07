import { useCvData } from "@/contexts/CVDataContext";
import AnimatedSection from "./AnimatedSection";
import { ExternalLink } from "lucide-react";

const PortfolioSection = () => {
  const { data } = useCvData();

  return (
    <section id="portfolio" className="section-spacing bg-card">
      <div className="section-container">
        <AnimatedSection>
          <p className="section-title">Portfolio</p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.portfolio.map((item, i) => (
            <AnimatedSection key={item.id} delay={0.05 * i}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-border bg-background p-6 hover:border-primary/40 hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col h-full justify-between gap-4">
                  <div>
                    <h3 className="font-display font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.descriptor}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.ctaLabel || "View"}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
