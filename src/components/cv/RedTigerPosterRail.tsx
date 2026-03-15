import { useMemo } from "react";
import { ExternalLink, Gamepad2 } from "lucide-react";
import TrademarkText from "./TrademarkText";
import type { PortfolioItem } from "@/data/cvData";

/* ── constants ── */
const POSTER_COUNT = 8;
const COMPACT_LIST_COUNT = 6;

/* ── types ── */
interface PosterCard {
  name: string;
  year: string;
  url?: string;
  posterSrc: string; // placeholder for now
}

/* ── component ── */
const RedTigerPosterRail = ({ item }: { item: PortfolioItem }) => {
  const posters: PosterCard[] = useMemo(() => {
    if (!item.games) return [];
    const sorted = [...item.games]
      .filter((g) => g.year)
      .sort((a, b) => Number(b.year) - Number(a.year));
    return sorted.slice(0, POSTER_COUNT).map((g) => ({
      name: g.name,
      year: g.year ?? "",
      url: g.url,
      posterSrc: item.thumbnail, // placeholder poster art
    }));
  }, [item.games, item.thumbnail]);

  const compactList = useMemo(() => {
    if (!item.games) return [];
    return item.games.filter((g) => g.url).slice(0, COMPACT_LIST_COUNT);
  }, [item.games]);

  return (
    <div className="mt-8">
      {/* ── Banner header ── */}
      <div className="relative overflow-hidden rounded-t-2xl border border-b-0 border-border bg-background">
        <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden">
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
            <h3 className="font-display font-bold text-xl md:text-2xl text-white drop-shadow-sm leading-tight">
              <TrademarkText text={item.title} />
            </h3>
            <p className="text-sm text-white/80 mt-1 max-w-xl leading-relaxed drop-shadow-sm">
              {item.descriptor}
            </p>
          </div>
        </div>
      </div>

      {/* ── Poster rail — Phase 1: static horizontal strip ── */}
      <div className="overflow-hidden rounded-b-2xl border border-border bg-background shadow-sm">
        <div className="p-6 md:p-8">
          <h4 className="inline-flex items-center gap-2 text-sm font-medium text-foreground mb-4">
            <Gamepad2 className="w-4 h-4 text-primary" />
            Featured Releases
          </h4>

          {/* Static scrollable track (Phase 2 will replace with sticky scroll) */}
          <div className="overflow-x-auto pb-4 -mx-6 px-6 md:-mx-8 md:px-8">
            <div className="flex gap-4" style={{ width: "max-content" }}>
              {posters.map((poster) => (
                <PosterCardComponent key={poster.name} poster={poster} />
              ))}
            </div>
          </div>

          {/* ── Compact list ── */}
          {compactList.length > 0 && (
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">More releases</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {compactList.map((game) => (
                  <a
                    key={game.name}
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group tag !flex cursor-pointer items-center justify-between gap-2 text-left transition-colors motion-short hover:text-primary"
                    aria-label={`Open ${game.name} in a new tab`}
                  >
                    <span className="truncate">
                      <TrademarkText text={game.name} />
                    </span>
                    <ExternalLink
                      className="h-3.5 w-3.5 shrink-0 opacity-100 transition-opacity motion-short md:opacity-0 md:group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer CTA ── */}
          <div className="mt-6 pt-5 border-t border-border flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Published under the Red Tiger brand</p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[box-shadow,transform] motion-medium active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hover:-translate-y-0.5 md:hover:shadow-md"
            >
              {item.ctaLabel || "View"}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Poster card (static shell — Phase 3 adds emphasis transforms) ── */
function PosterCardComponent({ poster }: { poster: PosterCard }) {
  const Wrapper = poster.url ? "a" : "div";
  const linkProps = poster.url
    ? { href: poster.url, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="group relative flex-shrink-0 w-[200px] md:w-[240px] overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] motion-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hover:border-primary/40 md:hover:shadow-md"
    >
      <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/15 via-accent/8 to-secondary/10">
        <img
          src={poster.posterSrc}
          alt={poster.name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          width={480}
          height={640}
        />
      </div>
      <div className="p-3 md:p-4">
        <p className="font-display text-sm font-semibold text-foreground leading-snug truncate transition-colors motion-short md:group-hover:text-primary">
          <TrademarkText text={poster.name} />
        </p>
        {poster.year && (
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground/80">
            {poster.year}
          </p>
        )}
      </div>
      {poster.url && (
        <span className="absolute top-2.5 right-2.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-background/90 text-primary opacity-100 shadow-sm backdrop-blur-sm transition-opacity motion-medium sm:opacity-0 sm:group-hover:opacity-100">
          <ExternalLink className="w-3.5 h-3.5" />
        </span>
      )}
    </Wrapper>
  );
}

export default RedTigerPosterRail;
