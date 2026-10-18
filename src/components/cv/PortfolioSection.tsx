import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import { ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { REVEAL, HOVER, HOVER_TRANSITION, SHADOW, GLOW, VIEWPORT } from "@/lib/motion";
import TrademarkText from "./TrademarkText";
import RedTigerPosterRail from "./RedTigerPosterRail";
import AmbientMotes from "./AmbientMotes";

const PortfolioSection = () => {
  const { data } = useCvData();
  const reduceMotion = useReducedMotion();
  const orderedItems = [...data.portfolio].sort((a, b) => a.order - b.order);

  const projectItems = orderedItems.filter((p) => p.type !== "collection");
  const collectionItems = orderedItems.filter((p) => p.type === "collection");

  return (
    <section id="portfolio" className="section-spacing bg-card relative" aria-labelledby="portfolio-title">
      <AmbientMotes count={8} seed={221} color="hsl(var(--primary) / 0.18)" parallaxStrength={10} />
      <div className="section-container relative z-10">
        <AnimatedSection>
          <h2 id="portfolio-title" className="section-title">
            Portfolio
          </h2>
        </AnimatedSection>

        <div className="grid gap-5 sm:grid-cols-2 md:gap-6">
          {projectItems.map((item, i) => (
            <motion.div
              key={item.id}
              custom={i}
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
                className="portfolio-card group block overflow-hidden rounded-xl border border-border bg-background transition-[border-color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                whileHover={reduceMotion ? undefined : HOVER.portfolio}
                whileTap={reduceMotion ? undefined : HOVER.press}
                transition={reduceMotion ? { duration: 0 } : HOVER_TRANSITION.portfolio}
              >
                <div className="aspect-[16/9] bg-secondary/30 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                    loading="lazy"
                    decoding="async"
                    width={1280}
                    height={720}
                  />
                  {/* Hover overlay */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0" style={{ background: GLOW.card }} />
                    <div className="absolute inset-0 ring-1 ring-inset ring-primary/15 rounded-t-xl" />
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" style={{ background: GLOW.shineSweep }} />
                  </div>
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-primary opacity-100 shadow-sm backdrop-blur-sm transition-all duration-300 sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0">
                    {item.ctaLabel || "View"}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>

                <div className="p-5 md:p-6">
                  <h3 className="font-display text-lg font-bold leading-snug text-foreground transition-colors duration-300 md:text-xl md:group-hover:text-primary">
                    <TrademarkText text={item.title} />
                  </h3>
                  {(item.year || item.category) && (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground/80">
                      {[item.year, item.category].filter(Boolean).join(" | ")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.descriptor}</p>
                </div>
              </motion.a>
            </motion.div>
          ))}
        </div>

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
