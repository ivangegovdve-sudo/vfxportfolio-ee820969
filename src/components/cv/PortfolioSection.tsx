import { useCvData } from "@/contexts/CVDataContext";
import AnimatedSection from "./AnimatedSection";
import { ExternalLink, Gamepad2, ChevronDown } from "lucide-react";

const gradientVariants = [
  "from-primary/15 via-primary/5 to-transparent",
  "from-accent/10 via-secondary/10 to-transparent",
  "from-primary/10 via-accent/5 to-transparent",
  "from-secondary/20 via-primary/5 to-transparent",
  "from-primary/8 via-secondary/8 to-transparent",
  "from-accent/12 via-primary/8 to-transparent",
];

const PortfolioSection = () => {
  const { data } = useCvData();

  const projectItems = data.portfolio.filter((p) => p.type !== "collection");
  const collectionItems = data.portfolio.filter((p) => p.type === "collection");

  return (
    <section id="portfolio" className="section-spacing bg-card">
      <div className="section-container">
        <AnimatedSection>
          <p className="section-title">Portfolio</p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 gap-6">
          {projectItems.map((item, i) => (
            <AnimatedSection key={item.id} delay={0.05 * i}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-border bg-background overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`aspect-[16/9] bg-gradient-to-br ${gradientVariants[i % gradientVariants.length]} flex items-center justify-center relative overflow-hidden`}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                    {item.ctaLabel || "View"}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-display font-semibold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {item.descriptor}
                  </p>
                </div>
              </a>
            </AnimatedSection>
          ))}
        </div>

        {collectionItems.map((item, i) => (
          <AnimatedSection key={item.id} delay={0.05 * (projectItems.length + i)}>
            <CollectionCard item={item} />
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
};

function CollectionCard({ item }: { item: import("@/data/cvData").PortfolioItem }) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-background overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/5 aspect-[16/9] md:aspect-auto bg-gradient-to-br from-primary/12 via-accent/8 to-secondary/10 flex items-center justify-center p-8">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-5">
          <div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.descriptor}
            </p>
          </div>

          {item.games && item.games.length > 0 && (
            <details className="rounded-lg border border-border bg-card/60 p-3">
              <summary className="list-none cursor-pointer flex items-center justify-between text-sm font-medium text-foreground">
                <span className="inline-flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-primary" />
                  Games I've worked on ({item.games.length})
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </summary>
              <ul className="mt-3 grid gap-1.5 text-xs text-muted-foreground max-h-64 overflow-y-auto pr-1">
                {item.games.map((game) => (
                  <li key={game.name}>
                    {game.url ? (
                      <a
                        href={game.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                      >
                        {game.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      game.name
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline self-start"
          >
            {item.ctaLabel || "View"}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default PortfolioSection;
