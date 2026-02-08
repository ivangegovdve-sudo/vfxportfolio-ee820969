import { useState } from "react";
import { useCvData } from "@/contexts/CVDataContext";
import AnimatedSection from "./AnimatedSection";
import { ExternalLink, Play, Film, ChevronDown, Gamepad2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

        {/* Project cards — 2-column grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {projectItems.map((item, i) => (
            <AnimatedSection key={item.id} delay={0.05 * i}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-border bg-background overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                {/* Visual header */}
                <div
                  className={`aspect-[16/9] bg-gradient-to-br ${gradientVariants[i % gradientVariants.length]} flex items-center justify-center relative overflow-hidden`}
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-primary/25 group-hover:text-primary/40 transition-colors">
                      <Film className="w-10 h-10" />
                    </div>
                  )}
                  {/* CTA overlay */}
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                    {item.ctaLabel || "View"}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>

                {/* Content */}
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

        {/* Collection cards — full width */}
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
  const [selectedGame, setSelectedGame] = useState<string>("");

  const handleGameSelect = (gameName: string) => {
    setSelectedGame(gameName);
    const game = item.games?.find((g) => g.name === gameName);
    if (game?.url) {
      window.open(game.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-border bg-background overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Visual side */}
        <div className="md:w-2/5 aspect-[16/9] md:aspect-auto bg-gradient-to-br from-primary/12 via-accent/8 to-secondary/10 flex items-center justify-center p-8">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-primary/30">
              <Gamepad2 className="w-14 h-14" />
              <span className="text-xs font-medium text-primary/40 tracking-wide uppercase">
                {item.games?.length || 0} Games
              </span>
            </div>
          )}
        </div>

        {/* Content side */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-5">
          <div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.descriptor}
            </p>
          </div>

          {/* Games dropdown */}
          {item.games && item.games.length > 0 && (
            <div className="space-y-2">
              <Select value={selectedGame} onValueChange={handleGameSelect}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder={`Games I've worked on (${item.games.length})`} />
                </SelectTrigger>
                <SelectContent className="max-h-64 bg-popover z-50">
                  {item.games.map((game) => (
                    <SelectItem key={game.name} value={game.name}>
                      <span className="flex items-center gap-2">
                        {game.name}
                        {game.url && <ExternalLink className="w-3 h-3 text-primary shrink-0" />}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* CTA link */}
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
