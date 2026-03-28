import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Gamepad2, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { REVEAL, HOVER, SHADOW, GLOW, VIEWPORT } from "@/lib/motion";
import TrademarkText from "./TrademarkText";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PortfolioItem } from "@/data/cvData";

const POSTER_COUNT = 10;
const DEFAULT_VISIBLE_GAMES = 8;
const TILT_MAX = 6; // degrees — restrained
const SHINE_RANGE = 40; // % offset for specular highlight

type RailGame = NonNullable<PortfolioItem["games"]>[number];

const toYearNumber = (year?: string) => {
  const parsed = Number(year);
  return Number.isFinite(parsed) ? parsed : 0;
};

/* ── Poster Card with pointer-tracked 3D tilt ── */

const PosterCard = ({
  game,
  fallbackThumb,
  index,
  reduceMotion,
  isMobile,
  isAnyHovered,
  isThisHovered,
  onHover,
  onLeave,
}: {
  game: RailGame;
  fallbackThumb: string;
  index: number;
  reduceMotion: boolean | null;
  isMobile: boolean;
  isAnyHovered: boolean;
  isThisHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef<number>(0);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (reduceMotion || isMobile) return;
      const card = cardRef.current;
      if (!card) return;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width; // 0-1
        const y = (e.clientY - rect.top) / rect.height; // 0-1
        const rotateY = (x - 0.5) * TILT_MAX * 2;
        const rotateX = (0.5 - y) * TILT_MAX * 2;
        const shineX = 50 + (x - 0.5) * SHINE_RANGE;
        const shineY = 50 + (y - 0.5) * SHINE_RANGE;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.03)`;
        card.style.setProperty("--shine-x", `${shineX}%`);
        card.style.setProperty("--shine-y", `${shineY}%`);
      });
    },
    [reduceMotion, isMobile]
  );

  const handlePointerLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const card = cardRef.current;
    if (card) {
      card.style.transform = "";
      card.style.removeProperty("--shine-x");
      card.style.removeProperty("--shine-y");
    }
    onLeave();
  }, [onLeave]);

  // Dim non-hovered siblings
  const dimmed = isAnyHovered && !isThisHovered;

  return (
    <motion.a
      ref={cardRef}
      data-red-tiger-poster
      href={game.url}
      target="_blank"
      rel="noopener noreferrer"
      custom={index}
      variants={REVEAL.poster}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileTap={reduceMotion ? undefined : HOVER.press}
      onPointerEnter={onHover}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`poster-card poster-card-3d group relative block w-[11.5rem] shrink-0 overflow-hidden rounded-xl border bg-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-[14rem] ${
        dimmed ? "border-white/[0.03]" : "border-white/[0.08]"
      }`}
      style={{
        opacity: dimmed ? 0.55 : 1,
        transition: "opacity 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: isThisHovered ? SHADOW.posterHover : SHADOW.posterRest,
        willChange: isThisHovered ? "transform" : "auto",
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={game.posterUrl || fallbackThumb}
          alt={game.name}
          className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          loading="lazy"
          decoding="async"
          width={420}
          height={560}
        />
        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Pointer-tracked specular highlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: "radial-gradient(circle at var(--shine-x, 50%) var(--shine-y, 30%), rgba(255,255,255,0.08) 0%, transparent 55%)",
          }}
        />

        {/* Warm glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-0" style={{ background: GLOW.primary }} />
          <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: GLOW.edgeLine }} />
        </div>

        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3 pt-6">
          <p className="text-[10px] uppercase tracking-[0.12em] text-white/50">{game.year}</p>
          <p className="mt-0.5 font-display text-sm font-semibold leading-snug text-white line-clamp-2 transition-colors duration-300 group-hover:text-primary">
            <TrademarkText text={game.name} />
          </p>
        </div>
      </div>

      {/* External link badge */}
      <span className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 scale-75 group-hover:scale-100">
        <ExternalLink className="h-3 w-3" />
      </span>
    </motion.a>
  );
};

/* ── Main Section ── */

const RedTigerPosterRail = ({ item }: { item: PortfolioItem }) => {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const railRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState("all");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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

  // Wheel-trap
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

  return (
    <motion.div
      ref={shellRef}
      variants={REVEAL.section}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT.eager}
      data-red-tiger-sticky-wrapper
      className="mt-10 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-[--shadow-rest] md:mt-12"
    >
      {/* ── Cinematic Header ── */}
      <div className="relative overflow-hidden border-b border-white/[0.06] bg-[linear-gradient(145deg,hsl(220_20%_8%)_0%,hsl(220_18%_13%)_60%,hsl(220_16%_16%)_100%)] px-6 pb-8 pt-8 md:px-10 md:pb-10 md:pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(251,191,36,0.1),transparent_50%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(251,191,36,0.05),transparent_50%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: GLOW.edgeLine }} aria-hidden="true" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
            <Gamepad2 className="h-3.5 w-3.5 text-primary" />
            Featured Collection
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-white md:text-3xl">
            <TrademarkText text={item.title} />
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55 md:text-[15px]">{item.descriptor}</p>
        </div>
      </div>

      {/* ── Poster Rail ── */}
      {posters.length > 0 && (
        <div className="relative border-b border-border/40 bg-gradient-to-b from-muted/30 via-background to-background" data-red-tiger-viewport>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />

          <div
            ref={railRef}
            data-red-tiger-track
            className="rail-scroll-trap flex gap-5 overflow-x-auto px-10 py-10 md:gap-7 md:px-12 md:py-12"
            style={{ perspective: "900px" }}
          >
            {posters.map((game, i) => (
              <PosterCard
                key={game.name}
                game={game}
                fallbackThumb={item.thumbnail}
                index={i}
                reduceMotion={reduceMotion}
                isMobile={isMobile}
                isAnyHovered={hoveredIdx !== null}
                isThisHovered={hoveredIdx === i}
                onHover={() => setHoveredIdx(i)}
                onLeave={() => setHoveredIdx(null)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Games Dashboard ── */}
      <div className="px-6 pb-8 pt-7 md:px-10 md:pb-10 md:pt-8">
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

            <div id={listId} className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
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
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-border px-4 text-sm font-medium text-primary transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto md:hover:bg-secondary/60 md:hover:text-primary/80"
                aria-expanded={isExpanded}
                aria-controls={listId}
              >
                {isExpanded ? "Show fewer games" : "View all released games"}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground/70">Published under the Red Tiger brand</p>
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
