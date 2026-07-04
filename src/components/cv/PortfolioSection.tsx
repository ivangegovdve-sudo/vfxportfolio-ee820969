import { useCvData } from "@/contexts/useCvData";
import SectionMarker from "./SectionMarker";
import { ExternalLink, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { REVEAL, HOVER, HOVER_TRANSITION, SHADOW, GLOW, VIEWPORT, DURATION, EASE_REVEAL } from "@/lib/motion";
import TrademarkText from "./TrademarkText";
import RedTigerPosterRail from "./RedTigerPosterRail";
import AmbientMotes from "./AmbientMotes";

/* Featured (full-width) card — for the hero/showreel slot */
const FeaturedCard = ({
  item,
  index,
}: {
  item: ReturnType<typeof useCvData>["data"]["portfolio"][number];
  index: number;
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      custom={index}
      variants={REVEAL.card}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT.standard}
      className="portfolio-card-wrapper"
    >
      <motion.a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="portfolio-card group block overflow-hidden rounded-sm border border-white/5 bg-card transition-[border-color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        whileHover={reduceMotion ? undefined : HOVER.portfolio}
        whileTap={reduceMotion ? undefined : HOVER.press}
        transition={reduceMotion ? { duration: 0 } : HOVER_TRANSITION.portfolio}
      >
        {/* Thumbnail — wider aspect for featured */}
        <div className="aspect-[21/9] bg-card relative overflow-hidden">
          <img
            src={item.thumbnail}
            alt={`${item.title}${item.category ? ` — ${item.category}` : ""} thumbnail`}
            className="w-full h-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            width={1920}
            height={820}
          />
          {/* Scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

          {/* Hover overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute inset-0" style={{ background: GLOW.card }} />
            <div className="absolute inset-0 ring-1 ring-inset ring-primary/10" />
            <div
              className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"
              style={{ background: GLOW.shineSweep }}
            />
          </div>

          {/* Play badge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-400 scale-90 group-hover:scale-100">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* CTA badge */}
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-sm bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground opacity-100 shadow-md transition-all duration-300 sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0"
            style={{ fontFamily: 'var(--font-mono)' }}>
            {item.ctaLabel || "View"}
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </span>
        </div>

        <div className="p-6 md:p-8 flex items-start justify-between gap-6">
          <div>
            <h3 className="font-display text-xl font-bold leading-tight text-foreground transition-colors duration-300 md:text-2xl md:group-hover:text-primary">
              <TrademarkText text={item.title} />
            </h3>
            {(item.year || item.category) && (
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                style={{ fontFamily: 'var(--font-mono)' }}>
                {[item.year, item.category].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed max-w-[60ch]">{item.descriptor}</p>
          </div>
        </div>
      </motion.a>
    </motion.div>
  );
};

/* Standard card */
const StandardCard = ({
  item,
  index,
}: {
  item: ReturnType<typeof useCvData>["data"]["portfolio"][number];
  index: number;
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      custom={index}
      variants={REVEAL.card}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT.standard}
      className="portfolio-card-wrapper"
    >
      <motion.a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="portfolio-card group flex flex-col overflow-hidden rounded-sm border border-white/5 bg-card h-full transition-[border-color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        whileHover={reduceMotion ? undefined : HOVER.portfolio}
        whileTap={reduceMotion ? undefined : HOVER.press}
        transition={reduceMotion ? { duration: 0 } : HOVER_TRANSITION.portfolio}
      >
        <div className="aspect-[16/9] bg-card flex items-center justify-center relative overflow-hidden flex-shrink-0">
          <img
            src={item.thumbnail}
            alt={`${item.title}${item.category ? ` — ${item.category}` : ""} thumbnail`}
            className="w-full h-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
          />
          {/* Hover overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute inset-0" style={{ background: GLOW.card }} />
            <div className="absolute inset-0 ring-1 ring-inset ring-primary/10" />
            <div
              className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"
              style={{ background: GLOW.shineSweep }}
            />
          </div>
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-sm bg-background/90 px-2.5 py-1 text-xs font-medium text-primary opacity-100 shadow-sm backdrop-blur-sm transition-all duration-300 sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0"
            style={{ fontFamily: 'var(--font-mono)' }}>
            {item.ctaLabel || "View"}
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </span>
        </div>

        <div className="p-5 md:p-6 flex-1 flex flex-col">
          <h3 className="font-display text-base font-bold leading-snug text-foreground transition-colors duration-300 md:text-lg md:group-hover:text-primary">
            <TrademarkText text={item.title} />
          </h3>
          {(item.year || item.category) && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70"
              style={{ fontFamily: 'var(--font-mono)' }}>
              {[item.year, item.category].filter(Boolean).join(" · ")}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">{item.descriptor}</p>
        </div>
      </motion.a>
    </motion.div>
  );
};

const PortfolioSection = () => {
  const { data } = useCvData();
  const orderedItems = [...data.portfolio].sort((a, b) => a.order - b.order);

  const projectItems = orderedItems.filter((p) => p.type !== "collection");
  const collectionItems = orderedItems.filter((p) => p.type === "collection");

  // Featured item: the showreel (order=4) or first item
  const featuredId = "pf-showreel";
  const featuredItem = projectItems.find((p) => p.id === featuredId) ?? projectItems[0];
  const remainingItems = projectItems.filter((p) => p.id !== featuredItem?.id);

  return (
    <section id="portfolio" className="section-spacing bg-card relative" aria-labelledby="portfolio-title">
      <AmbientMotes count={8} seed={221} color="rgba(214,162,64,0.12)" parallaxStrength={10} />

      <div className="section-container relative z-10">
        <SectionMarker index="01" title="Work" headingId="portfolio-title" />

        {/* Featured card — full width showreel */}
        {featuredItem && (
          <div className="mb-5 md:mb-6">
            <FeaturedCard item={featuredItem} index={0} />
          </div>
        )}

        {/* Remaining project cards — asymmetric grid */}
        {remainingItems.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {remainingItems.map((item, i) => (
              <StandardCard key={item.id} item={item} index={i + 1} />
            ))}
          </div>
        )}

        {/* Gold rule before collection */}
        {collectionItems.length > 0 && remainingItems.length > 0 && (
          <div className="mt-16 mb-0">
            <div className="gold-line" />
          </div>
        )}

        {/* Collections */}
        {collectionItems.map((item) => (
          <div key={item.id}>
            <RedTigerPosterRail item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PortfolioSection;
