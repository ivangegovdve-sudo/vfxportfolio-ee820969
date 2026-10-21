import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiProjects } from "@/data/aiProjects";
import { HOVER, HOVER_TRANSITION, REVEAL, VIEWPORT } from "@/lib/motion";
import AnimatedSection from "./AnimatedSection";

export function AiPortfolioSection() {
  const reduceMotion = useReducedMotion();
  return (
    <section id="portfolio" className="section-spacing bg-card relative" aria-labelledby="portfolio-title">
      <div className="section-container">
        <AnimatedSection><h2 id="portfolio-title" className="section-title">Portfolio</h2></AnimatedSection>
        <div className="grid items-start gap-5 sm:grid-cols-2 md:gap-6">
          {aiProjects.map((project, index) => (
            <motion.article
              key={project.id} aria-labelledby={`${project.id}-title`}
              custom={index} variants={REVEAL.card} initial={reduceMotion ? false : "hidden"}
              whileInView="visible" viewport={VIEWPORT.standard}
              whileHover={reduceMotion ? undefined : HOVER.portfolio}
              transition={reduceMotion ? { duration: 0 } : HOVER_TRANSITION.portfolio}
              className="overflow-hidden rounded-lg border border-border bg-background"
            >
              {project.thumbnail && (
                <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <img src={project.thumbnail} alt={`${project.title} — verified public interface`} loading="lazy" decoding="async" className="block h-auto w-full" />
                </a>
              )}
              <div className="p-5 md:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded border border-border bg-secondary/30 px-2 py-1 text-primary">{project.status}</span>
                  <span>{project.year}</span>
                </div>
                <h3 id={`${project.id}-title`} className="font-display text-lg font-bold leading-snug text-foreground md:text-xl">
                  {project.url ? <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{project.title}</a> : project.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.descriptor}</p>
                <div className="mt-4 flex flex-wrap gap-2">{project.keywords.map((keyword) => <span key={keyword} className="tag max-w-full whitespace-normal break-words">{keyword}</span>)}</div>
                {project.warning && <p className="mt-4 border-l-2 border-primary/40 pl-3 text-xs leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Data population · review flag. </span>{project.warning}</p>}
                {project.sourceNote && <p className="mt-4 text-xs text-muted-foreground">{project.sourceNote}</p>}
                {project.url && <Button asChild variant="outline" size="sm" className="mt-5 gap-2"><a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.ctaLabel}: ${project.title}`}>{project.ctaLabel}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></Button>}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}