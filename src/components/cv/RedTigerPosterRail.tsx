import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Gamepad2, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import TrademarkText from "./TrademarkText";
import type { PortfolioItem } from "@/data/cvData";

const POSTER_COUNT = 10;
const DEFAULT_VISIBLE_GAMES = 8;

type RailGame = NonNullable<PortfolioItem["games"]>[number];

const toYearNumber = (year?: string) => {
  const parsed = Number(year);
  return Number.isFinite(parsed) ? parsed : 0;
};

const RedTigerPosterRail = ({ item }: { item: PortfolioItem }) => {
  const reduceMotion = useReducedMotion();
  const railRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState("all");
  const [hoveredPoster, setHoveredPoster] = useState<string | null>(null);

  const sortedGames = useMemo(() => {
    if (!item.games) return [] as RailGame[];
    return item.games
      .map((game, index) => ({ game, index, yearNumber: toYearNumber(game.year) }))
      .sort((a, b) => (b.yearNumber !== a.yearNumber ? b.yearNumber - a.yearNumber : a.index - b.index))
      .map(({ game }) => game);
  }, [item.games]);

  const posters = useMemo(
    () => sortedGames.filter((g) => g.posterUrl).slice(0, POSTER_COUNT),
    [sortedGames]
  );

  const years = useMemo(() => {
    if (!item.games) return [];
    return [...new Set(item.games.map((g) => g.year).filter(Boolean))]
      .sort((a, b) => Number(b) - Number(a))
      .map(String);
  }, [item.games]);

  const filteredGames = useMemo(() => {
    if (!item.games) return [];
    if (selectedYear === "all") return sortedGames;
    return sortedGames.filter((g) => String(g.year) === selectedYear);
  }, [sortedGames, selectedYear, item.games]);

  const visibleGames = isExpanded ? filteredGames : filteredGames.slice(0, DEFAULT_VISIBLE_GAMES);
  const canToggle = filteredGames.length > DEFAULT_VISIBLE_GAMES;
  const listId = `${item.id}-games-list`;

  // Wheel-trap: capture wheel events inside shell and scroll the rail horizontally
  useEffect(() => {
    const rail = railRef.current;
    const shell = shellRef.current;
    if (!rail || !shell) return;

    const handleWheel = (e: WheelEvent) => {
      const { scrollLeft, scrollWidth, clientWidth } = rail;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) return;

      const atStart = scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = scrollLeft >= maxScroll - 1 && e.deltaY > 0;

      if (!atStart && !atEnd) {
        e.preventDefault();
        rail.scrollLeft += e.deltaY;
      }
    };

    shell.addEventListener("wheel", handleWheel, { passive: false });
    return () => shell.removeEventListener("wheel", handleWheel);
  }, []);

  const entryVariants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30, filter: "blur(6px)" },
    visible: reduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const posterVariants = {
    hidden: reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88, y: 16 },
    visible: (i: number) =>
      reduceMotion
        ? { opacity: 1, scale: 1 }
        : {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              duration: 0.6,
              delay: i * 0.07,
              ease: [0.16, 1, 0.3, 1] as const,
            },
          },
  };

  return (
    <motion.div
      ref={shellRef}
      variants={entryVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      data-red-tiger-sticky-wrapper
      className="mt-8 overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow duration-300 md:hover:shadow-lg"
    >
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,hsl(220_20%_10%)_0%,hsl(220_18%_14%)_100%)] px-6 pb-6 pt-7 md:px-8 md:pb-7 md:pt-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(251,191,36,0.12),transparent_42%)]" aria-hidden="true" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            <Gamepad2 className="h-3.5 w-3.5 text-primary" />
            Featured Releases
          </div>
          <h3 className="mt-3 font-display text-xl font-bold leading-tight text-white md:text-2xl">
            <TrademarkText text={item.title} />
          </h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/70">{item.descriptor}</p>
        </div>
      </div>

      {/* Poster Rail */}
      {posters.length > 0 && (
        <div className="relative border-b border-border/60 bg-gradient-to-b from-background to-secondary/20" data-red-tiger-viewport>
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />

          <div
            ref={railRef}
            data-red-tiger-track
            className="rail-scroll-trap flex gap-5 overflow-x-auto px-8 py-8 md:gap-6 md:px-10 md:py-10"
            style={{ perspective: "1200px" }}
          >
            {posters.map((game, i) => {
              const isHovered = hoveredPoster === game.name;
              return (
                <motion.a
                  key={game.name}
                  data-red-tiger-poster
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  custom={i}
                  variants={posterVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -10,
                          scale: 1.04,
                          rotateY: 0,
                          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                        }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  onHoverStart={() => setHoveredPoster(game.name)}
                  onHoverEnd={() => setHoveredPoster(null)}
                  className="poster-card group relative block w-[12rem] shrink-0 overflow-hidden rounded-xl border border-border/40 bg-slate-950 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-[14rem]"
                  style={{
                    boxShadow: isHovered
                      ? "0 20px 40px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(251,191,36,0.15)"
                      : "0 4px 12px -4px rgba(0,0,0,0.15)",
                    transition: "box-shadow 0.4s ease-out",
                  }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={game.posterUrl || item.thumbnail}
                      alt={game.name}
                      className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                      loading="lazy"
                      decoding="async"
                      width={480}
                      height={300}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    {/* Premium hover glow */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(251,191,36,0.2),transparent_55%)]" />
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    </div>
                  </div>
                  <div className="relative px-3.5 pb-3.5 pt-2.5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">{game.year}</p>
                    <p className="mt-0.5 font-display text-sm font-semibold leading-snug text-foreground line-clamp-2 transition-colors duration-300 group-hover:text-primary">
                      <TrademarkText text={game.name} />
                    </p>
                  </div>
                  <span className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-75">
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </motion.a>
              );
            })}
          </div>
        </div>
      )}

      {/* Games Dashboard */}
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
                    className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Filter released games by year"
                  >
                    <option value="all">All years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
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
                    className="group tag !flex cursor-pointer items-center justify-between gap-2 text-left transition-all duration-200 hover:text-primary hover:shadow-sm"
                    title={game.name}
                    aria-label={`Open ${game.name}${gameMeta} in a new tab`}
                  >
                    <span className="truncate">
                      <TrademarkText text={game.name} />
                    </span>
                    <ExternalLink
                      className="h-3.5 w-3.5 shrink-0 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
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
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-border px-4 text-sm font-medium text-primary transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto md:hover:bg-secondary/60 md:hover:text-primary/80"
                aria-expanded={isExpanded}
                aria-controls={listId}
              >
                {isExpanded ? "Show fewer games" : "View all released games"}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
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
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hover:-translate-y-0.5 md:hover:shadow-md"
          >
            {item.ctaLabel || "View"}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default RedTigerPosterRail;
