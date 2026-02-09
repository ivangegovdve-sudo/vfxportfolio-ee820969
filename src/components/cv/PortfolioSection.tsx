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
    <section id="portfolio" className="section-spacing bg-card" aria-labelledby="portfolio-title">
      <div className="section-container">
        <AnimatedSection>
          <h2 id="portfolio-title" className="section-title">
            Portfolio
          </h2>
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
                    width={1280}
                    height={720}
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
  const gameCount = item.games?.length ?? 0;

  return (
    <div className="mt-8 rounded-2xl border border-border bg-background overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Hero banner */}
      <div className="relative aspect-[21/9] md:aspect-[3/1] bg-gradient-to-br from-primary/15 via-accent/8 to-secondary/10 overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          width={1280}
          height={420}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-xl md:text-2xl text-white drop-shadow-sm leading-tight">
                {item.title}
              </h3>
              <p className="text-sm text-white/80 mt-1 max-w-xl leading-relaxed drop-shadow-sm">
                {item.descriptor}
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white border border-white/20">
              <Gamepad2 className="w-3.5 h-3.5" />
              {gameCount} games
            </span>
          </div>
        </div>
      </div>

      {/* Games grid + CTA */}
      <div className="p-6 md:p-8">
        {item.games && gameCount > 0 && (
          <details className="group">
            <summary className="list-none cursor-pointer flex items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors select-none">
              <span className="inline-flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-primary" />
                Browse all {gameCount} games
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {item.games.map((game) => (
                <span
                  key={game.name}
                  className="tag text-center truncate"
                  title={game.name}
                >
                  {game.url ? (
                    <a
                      href={game.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {game.name}
                    </a>
                  ) : (
                    game.name
                  )}
                </span>
              ))}
            </div>
          </details>
        )}

        <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Published under the Red Tiger brand
          </p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
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
