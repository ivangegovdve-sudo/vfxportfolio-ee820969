import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import { ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION_TOKENS } from "@/lib/motion";
import TrademarkText from "./TrademarkText";
import RedTigerPosterRail from "./RedTigerPosterRail";

const PortfolioSection = () => {
  const { data } = useCvData();
  const reduceMotion = useReducedMotion();
  const orderedItems = [...data.portfolio].sort((a, b) => a.order - b.order);

  const projectItems = orderedItems.filter((p) => p.type !== "collection");
  const collectionItems = orderedItems.filter((p) => p.type === "collection");

  const cardVariants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: (i: number) =>
      reduceMotion
        ? { opacity: 1 }
        : {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
              duration: 0.65,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            },
          },
  };

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
            <motion.div
              key={item.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-[border-color,box-shadow] motion-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hover:border-primary/40 md:hover:shadow-lg"
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: MOTION_TOKENS.hoverElevate, scale: MOTION_TOKENS.portfolioHoverScale }
                }
                whileTap={reduceMotion ? undefined : { scale: MOTION_TOKENS.pressScale }}
                transition={reduceMotion ? { duration: 0 } : MOTION_TOKENS.portfolioHoverSpring}
              >
                <div className="aspect-[16/9] bg-secondary/30 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                    width={1280}
                    height={720}
                  />
                  {/* Hover highlight overlay */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.1),transparent_70%)]" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-primary/20 rounded-t-xl" />
                  </div>
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
              </motion.a>
            </motion.div>
          ))}
        </div>

        {collectionItems.map((item) => (
          <div key={item.id}>
            {item.id === "pf-redtiger" ? (
              <RedTigerPosterRail item={item} />
            ) : (
              <RedTigerPosterRail item={item} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PortfolioSection;
