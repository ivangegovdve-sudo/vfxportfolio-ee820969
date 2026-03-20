import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Gamepad2 } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import TrademarkText from "./TrademarkText";
import type { PortfolioItem } from "@/data/cvData";

const NAV_OFFSET_PX = 64;
const EXIT_BUFFER_PX = 96;
const POSTER_COUNT = 8;
const COMPACT_LIST_COUNT = 6;

type RailGame = NonNullable<PortfolioItem["games"]>[number];
type MeasureNode = HTMLAnchorElement | HTMLDivElement;

type PosterCard = {
  name: string;
  year: string;
  url?: string;
  posterSrc: string;
};

type LayoutMetrics = {
  viewportHeightPx: number;
  stickyHeightPx: number;
  viewportWidthPx: number;
  trackWidthPx: number;
  cardWidthPx: number;
  gapPx: number;
  travelPx: number;
  wrapperHeightPx: number;
  trackStartPadPx: number;
};

const EMPTY_METRICS: LayoutMetrics = {
  viewportHeightPx: 0,
  stickyHeightPx: 0,
  viewportWidthPx: 0,
  trackWidthPx: 0,
  cardWidthPx: 0,
  gapPx: 0,
  travelPx: 0,
  wrapperHeightPx: 0,
  trackStartPadPx: 0,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const smoothstep = (value: number) => value * value * (3 - 2 * value);

const toYearNumber = (year?: string) => {
  const parsed = Number(year);
  return Number.isFinite(parsed) ? parsed : 0;
};

const hasMetricsChanged = (current: LayoutMetrics, next: LayoutMetrics) =>
  Object.keys(current).some((key) => current[key as keyof LayoutMetrics] !== next[key as keyof LayoutMetrics]);

const RedTigerPosterRail = ({ item }: { item: PortfolioItem }) => {
  const reduceMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<MeasureNode | null>(null);
  const [metrics, setMetrics] = useState<LayoutMetrics>(EMPTY_METRICS);

  const sortedGames = useMemo(() => {
    if (!item.games) {
      return [] as RailGame[];
    }

    return item.games
      .map((game, index) => ({ game, index, yearNumber: toYearNumber(game.year) }))
      .sort((a, b) => {
        if (b.yearNumber !== a.yearNumber) {
          return b.yearNumber - a.yearNumber;
        }

        return a.index - b.index;
      })
      .map(({ game }) => game);
  }, [item.games]);

  const posters = useMemo<PosterCard[]>(
    () =>
      sortedGames.slice(0, POSTER_COUNT).map((game) => ({
        name: game.name,
        year: game.year ?? "",
        url: game.url,
        posterSrc: item.thumbnail,
      })),
    [item.thumbnail, sortedGames]
  );

  const compactList = useMemo(() => sortedGames.filter((game) => game.url).slice(0, COMPACT_LIST_COUNT), [sortedGames]);

  const setFirstCardNode = useCallback((node: MeasureNode | null) => {
    firstCardRef.current = node;
  }, []);

  const measureLayout = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !viewportRef.current ||
      !trackRef.current ||
      !firstCardRef.current ||
      posters.length === 0
    ) {
      return;
    }

    const viewportHeightPx = window.innerHeight;
    const stickyHeightPx = Math.max(viewportHeightPx - NAV_OFFSET_PX, 0);
    const viewportWidthPx = Math.round(viewportRef.current.clientWidth);
    const cardWidthPx = Math.round(firstCardRef.current.getBoundingClientRect().width);
    const trackStyles = window.getComputedStyle(trackRef.current);
    const gapPx = Math.round(parseFloat(trackStyles.columnGap || trackStyles.gap || "0") || 0);
    const trackStartPadPx = Math.max(Math.round((viewportWidthPx - cardWidthPx) / 2), 0);
    const derivedTrackWidthPx =
      posters.length * cardWidthPx + Math.max(posters.length - 1, 0) * gapPx + trackStartPadPx * 2;
    const trackWidthPx = Math.max(Math.round(trackRef.current.scrollWidth), derivedTrackWidthPx);
    const travelPx = Math.max(trackWidthPx - viewportWidthPx, 0);
    const wrapperHeightPx = stickyHeightPx + travelPx + EXIT_BUFFER_PX;

    const nextMetrics: LayoutMetrics = {
      viewportHeightPx,
      stickyHeightPx,
      viewportWidthPx,
      trackWidthPx,
      cardWidthPx,
      gapPx,
      travelPx,
      wrapperHeightPx,
      trackStartPadPx,
    };

    setMetrics((current) => (hasMetricsChanged(current, nextMetrics) ? nextMetrics : current));
  }, [posters.length]);

  useLayoutEffect(() => {
    if (reduceMotion) {
      return;
    }

    measureLayout();
    const frame = window.requestAnimationFrame(measureLayout);

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measureLayout);

      return () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("resize", measureLayout);
      };
    }

    const observer = new ResizeObserver(() => measureLayout());

    if (viewportRef.current) {
      observer.observe(viewportRef.current);
    }

    if (trackRef.current) {
      observer.observe(trackRef.current);
    }

    if (firstCardRef.current) {
      observer.observe(firstCardRef.current);
    }

    window.addEventListener("resize", measureLayout);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measureLayout);
    };
  }, [measureLayout, reduceMotion]);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });

  const xRaw = useTransform(scrollYProgress, (value) => -metrics.travelPx * value);
  const x = useSpring(xRaw, {
    stiffness: 320,
    damping: 34,
    mass: 0.45,
  });
  const ambientShift = useTransform(x, (latest) => latest * -0.08);

  const renderStaticRail = reduceMotion || posters.length === 0;

  return (
    <div
      data-red-tiger-shell
      className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,rgba(12,16,26,0.98)_0%,rgba(22,29,42,0.92)_26%,rgba(245,243,238,0.98)_65%,rgba(252,251,248,1)_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
    >
      <div className="pointer-events-none absolute inset-x-10 top-6 h-28 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-[18%] top-24 h-32 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

      <div className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.2),transparent_38%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(15,23,42,0.88))] px-6 pb-8 pt-8 md:px-8 md:pb-10 md:pt-9">
        <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.06),transparent_42%,rgba(251,191,36,0.08)_100%)]" aria-hidden="true" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            <Gamepad2 className="h-3.5 w-3.5 text-primary" />
            Featured Releases
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-white md:text-[2rem]">
            <TrademarkText text={item.title} />
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75 md:text-[0.95rem]">
            {item.descriptor}
          </p>
        </div>
      </div>

      {renderStaticRail ? (
        <StaticPosterStrip
          compactList={compactList}
          item={item}
          posters={posters}
          setFirstCardNode={setFirstCardNode}
        />
      ) : (
        <div
          ref={wrapperRef}
          data-red-tiger-sticky-wrapper
          className="relative"
          style={{ height: metrics.wrapperHeightPx || undefined }}
        >
          <div
            ref={viewportRef}
            className="sticky overflow-hidden border-b border-border/60 bg-[linear-gradient(180deg,rgba(250,248,243,0.98)_0%,rgba(245,242,235,0.96)_100%)]"
            style={{
              top: NAV_OFFSET_PX,
              height: metrics.stickyHeightPx || undefined,
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.48),transparent)]" aria-hidden="true" />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-[18%] top-12 h-32 w-40 rounded-full bg-primary/12 blur-3xl"
              style={{ x: ambientShift }}
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-14 right-[16%] h-24 w-32 rounded-full bg-slate-900/10 blur-3xl"
              style={{ x: ambientShift }}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-14 bg-[linear-gradient(90deg,rgba(245,242,235,0.96),transparent)]" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-14 bg-[linear-gradient(270deg,rgba(245,242,235,0.96),transparent)]" aria-hidden="true" />

            <div className="flex h-full flex-col justify-between px-6 pb-7 pt-8 md:px-8 md:pb-8 md:pt-10">
              <div className="relative flex-1 overflow-hidden" data-red-tiger-viewport>
                <motion.div
                  ref={trackRef}
                  data-red-tiger-track
                  className="flex h-full items-center gap-5"
                  style={{
                    x,
                    paddingLeft: metrics.trackStartPadPx,
                    paddingRight: metrics.trackStartPadPx,
                    willChange: "transform",
                  }}
                >
                  {posters.map((poster, index) => (
                    <PosterCardComponent
                      key={poster.name}
                      index={index}
                      metrics={metrics}
                      poster={poster}
                      setMeasureNode={index === 0 ? setFirstCardNode : undefined}
                      x={x}
                    />
                  ))}
                </motion.div>
              </div>

              <CompactReleaseList compactList={compactList} />
              <RailFooter item={item} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StaticPosterStrip({
  compactList,
  item,
  posters,
  setFirstCardNode,
}: {
  compactList: RailGame[];
  item: PortfolioItem;
  posters: PosterCard[];
  setFirstCardNode: (node: MeasureNode | null) => void;
}) {
  return (
    <div className="relative border-t border-white/8 bg-[linear-gradient(180deg,rgba(250,248,243,0.98)_0%,rgba(245,242,235,0.96)_100%)] px-6 pb-7 pt-8 md:px-8 md:pb-8 md:pt-10">
      <div className="-mx-6 overflow-x-auto px-6 pb-4 md:-mx-8 md:px-8">
        <div className="flex min-w-max gap-5">
          {posters.map((poster, index) => (
            <PosterCardComponent
              key={poster.name}
              index={index}
              interactive={false}
              metrics={EMPTY_METRICS}
              poster={poster}
              setMeasureNode={index === 0 ? setFirstCardNode : undefined}
            />
          ))}
        </div>
      </div>

      <CompactReleaseList compactList={compactList} />
      <RailFooter item={item} />
    </div>
  );
}

function CompactReleaseList({ compactList }: { compactList: RailGame[] }) {
  if (compactList.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-border/70 pt-5" data-red-tiger-compact-list>
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground/80">More releases</p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
        {compactList.map((game) => (
          <a
            key={game.name}
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group tag !flex min-h-11 items-center justify-between gap-2 text-left transition-[transform,color,box-shadow] motion-medium hover:-translate-y-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Open ${game.name}${game.year ? ` (${game.year})` : ""} in a new tab`}
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
  );
}

function RailFooter({ item }: { item: PortfolioItem }) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/70 pt-5">
      <p className="text-xs text-muted-foreground">Published under the Red Tiger brand</p>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[box-shadow,transform] motion-medium active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hover:-translate-y-0.5 md:hover:shadow-md"
      >
        {item.ctaLabel || "View"}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function PosterCardComponent({
  index,
  interactive = true,
  metrics,
  poster,
  setMeasureNode,
  x,
}: {
  index: number;
  interactive?: boolean;
  metrics: LayoutMetrics;
  poster: PosterCard;
  setMeasureNode?: (node: MeasureNode | null) => void;
  x?: MotionValue<number>;
}) {
  const stepPx = metrics.cardWidthPx + metrics.gapPx || 1;

  const emphasis = useTransform(() => {
    if (!interactive || !x || !metrics.viewportWidthPx || !metrics.cardWidthPx) {
      return 1;
    }

    const cardCenterX = metrics.trackStartPadPx + index * stepPx + metrics.cardWidthPx / 2 + x.get();
    const viewportCenterX = metrics.viewportWidthPx / 2;
    const distPx = Math.abs(cardCenterX - viewportCenterX);
    const d = clamp(distPx / (stepPx * 1.5), 0, 1);
    const u = 1 - d;
    return smoothstep(u);
  });

  const offsetRatio = useTransform(() => {
    if (!interactive || !x || !metrics.viewportWidthPx || !metrics.cardWidthPx) {
      return 0;
    }

    const cardCenterX = metrics.trackStartPadPx + index * stepPx + metrics.cardWidthPx / 2 + x.get();
    const viewportCenterX = metrics.viewportWidthPx / 2;
    return (cardCenterX - viewportCenterX) / stepPx;
  });

  const scale = useTransform(() => (interactive ? 0.92 + emphasis.get() * 0.12 : 1));
  const opacity = useTransform(() => (interactive ? 0.58 + emphasis.get() * 0.42 : 1));
  const lift = useTransform(() => (interactive ? 18 - emphasis.get() * 18 : 0));
  const zIndex = useTransform(() => Math.round(interactive ? 10 + emphasis.get() * 40 : 1));
  const rotate = useTransform(() => {
    if (!interactive) {
      return 0;
    }

    const smooth = emphasis.get();
    if (smooth > 0.85) {
      return 0;
    }

    return clamp(-offsetRatio.get() * 5.5, -7, 7);
  });

  const shadow = useTransform(() => {
    const smooth = emphasis.get();
    const y = Math.round(18 + smooth * 22);
    const blur = Math.round(32 + smooth * 26);
    const alpha = (0.14 + smooth * 0.14).toFixed(3);
    return `0 ${y}px ${blur}px rgba(15, 23, 42, ${alpha})`;
  });

  const borderColor = useTransform(() => {
    const smooth = emphasis.get();
    return `rgba(251, 191, 36, ${(0.14 + smooth * 0.2).toFixed(3)})`;
  });

  const baseClassName =
    "group relative block w-[13.75rem] shrink-0 overflow-hidden rounded-[1.35rem] border bg-slate-950 text-left transition-[border-color,box-shadow,opacity] motion-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-[15.5rem]";

  const posterContent = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={poster.posterSrc}
          alt={poster.name}
          className="h-full w-full object-cover transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
          loading="lazy"
          decoding="async"
          width={480}
          height={640}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12),transparent_26%,rgba(15,23,42,0.78)_100%)]" />
        <div className="absolute inset-0 opacity-0 transition-opacity motion-medium group-hover:opacity-100 group-focus-visible:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_45%)]" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/70">{poster.year || "Red Tiger"}</p>
          <p className="mt-1 font-display text-base font-semibold leading-snug text-white">
            <TrademarkText text={poster.name} />
          </p>
        </div>
      </div>

      {poster.url && (
        <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/85 opacity-0 shadow-sm backdrop-blur-sm transition-opacity motion-medium group-hover:opacity-100 group-focus-visible:opacity-100">
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      )}
    </>
  );

  if (poster.url) {
    return (
      <motion.a
        ref={setMeasureNode}
        data-red-tiger-poster
        href={poster.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClassName} md:hover:border-primary/35`}
        style={
          interactive
            ? {
                borderColor,
                boxShadow: shadow,
                opacity,
                rotate,
                scale,
                y: lift,
                zIndex,
              }
            : undefined
        }
      >
        {posterContent}
      </motion.a>
    );
  }

  return (
    <motion.div
      ref={setMeasureNode}
      data-red-tiger-poster
      className={baseClassName}
      style={
        interactive
          ? {
              borderColor,
              boxShadow: shadow,
              opacity,
              rotate,
              scale,
              y: lift,
              zIndex,
            }
          : undefined
      }
    >
      {posterContent}
    </motion.div>
  );
}

export default RedTigerPosterRail;
