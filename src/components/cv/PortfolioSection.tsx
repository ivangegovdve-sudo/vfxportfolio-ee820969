import { useMemo, useState } from "react";
import { useCvData } from "@/contexts/CVDataContext";
import AnimatedSection from "./AnimatedSection";
import { ExternalLink, Gamepad2, ChevronDown } from "lucide-react";
import TrademarkText from "./TrademarkText";

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
  const orderedItems = [...data.portfolio].sort((a, b) => a.order - b.order);

  const projectItems = orderedItems.filter((p) => p.type !== "collection");
  const collectionItems = orderedItems.filter((p) => p.type === "collection");

  return (
    <section id="portfolio" className="section-spacing bg-card" aria-labelledby="portfolio-title">
      <div className="section-container">
        <AnimatedSection>
          <h2 id="portfolio-title" className="section-title">
            Portfolio
          </h2>
        </AnimatedSection>

        <div className="grid gap-5 sm:grid-cols-2 md:gap-6">
          {projectItems.map((item, i) => (
            <AnimatedSection key={item.id} delay={0.05 * i}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover-elevate block overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-[border-color,box-shadow,transform] motion-medium md:hover:border-primary/40 md:hover:shadow-lg"
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
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-primary opacity-100 shadow-sm backdrop-blur-sm transition-opacity motion-medium sm:opacity-0 sm:group-hover:opacity-100">
                    {item.ctaLabel || "View"}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>

                <div className="p-5 md:p-6">
                  <h3 className="font-display text-lg font-bold leading-snug text-foreground transition-colors motion-short md:text-xl md:group-hover:text-primary">
                    <TrademarkText text={item.title} />
                  </h3>
                  {(item.year || item.category) && (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground/80">
                      {[item.year, item.category].filter(Boolean).join(" | ")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.descriptor}</p>
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
  const DEFAULT_VISIBLE_GAMES = 8;
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState("all");
  const listId = `${item.id}-games-list`;

  const years = useMemo(() => {
    if (!item.games) return [];
    return [...new Set(item.games.map((game) => game.year).filter(Boolean))]
      .sort((a, b) => Number(b) - Number(a))
      .map(String);
  }, [item.games]);

  const filteredGames = useMemo(() => {
    if (!item.games) return [];
    if (selectedYear === "all") return item.games;
    return item.games.filter((game) => String(game.year) === selectedYear);
  }, [item.games, selectedYear]);

  const visibleGames = isExpanded ? filteredGames : filteredGames.slice(0, DEFAULT_VISIBLE_GAMES);
  const canToggle = filteredGames.length > DEFAULT_VISIBLE_GAMES;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow motion-medium md:hover:shadow-md">
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
                <TrademarkText text={item.title} />
              </h3>
              <p className="text-sm text-white/80 mt-1 max-w-xl leading-relaxed drop-shadow-sm">{item.descriptor}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {item.games && item.games.length > 0 && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <Gamepad2 className="w-4 h-4 text-primary" />
                Released / Published games
              </h4>
              {years.length > 0 && (
                <div className="inline-flex items-center gap-2">
                  <label htmlFor={`${item.id}-year-filter`} className="text-xs text-muted-foreground">
                    Filter by year
                  </label>
                  <select
                    id={`${item.id}-year-filter`}
                    value={selectedYear}
                    onChange={(event) => {
                      setSelectedYear(event.target.value);
                      setIsExpanded(false);
                    }}
                    className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground transition-colors motion-short focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Filter released games by year"
                  >
                    <option value="all">All years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div id={listId} className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {visibleGames.map((game) => {
                const hasUrl = !!game.url;
                const gameMeta = game.year ? ` (${game.year})` : "";
                return hasUrl ? (
                  <a
                    key={game.name}
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group tag !flex cursor-pointer items-center justify-between gap-2 text-left transition-colors motion-short hover:text-primary"
                    title={game.name}
                    aria-label={`Open ${game.name}${gameMeta} in a new tab`}
                  >
                    <span className="truncate">
                      <TrademarkText text={game.name} />
                    </span>
                    <ExternalLink
                      className="h-3.5 w-3.5 shrink-0 opacity-100 transition-opacity motion-short md:opacity-0 md:group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </a>
                ) : (
                  <span
                    key={game.name}
                    className="tag !flex items-center justify-between gap-2 text-left opacity-80"
                    title={game.name}
                  >
                    <span className="truncate">
                      <TrademarkText text={game.name} />
                    </span>
                  </span>
                );
              })}
            </div>

            {filteredGames.length === 0 && (
              <p className="mt-4 text-xs text-muted-foreground">No released games found for this year.</p>
            )}

            {canToggle && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-border px-4 text-sm font-medium text-primary transition-[background-color,color,transform] motion-medium active:scale-[0.98] sm:w-auto md:hover:bg-secondary/60 md:hover:text-primary/80"
                aria-expanded={isExpanded}
                aria-controls={listId}
              >
                {isExpanded ? "Show fewer games" : "View all released games"}
                <ChevronDown className={`h-4 w-4 transition-transform motion-short ${isExpanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-border flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Published under the Red Tiger brand</p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[box-shadow,transform] motion-medium active:scale-[0.98] md:hover:-translate-y-0.5 md:hover:shadow-md"
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
