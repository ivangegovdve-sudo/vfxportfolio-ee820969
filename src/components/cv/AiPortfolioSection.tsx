import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiProjectGroups, aiProjects } from "@/data/aiProjects";
import { REVEAL, VIEWPORT } from "@/lib/motion";
import AnimatedSection from "./AnimatedSection";

function AiProjectCard({ project }: { project: (typeof aiProjects)[number] }) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const detailsId = `${project.id}-details`;
  return (
    <motion.article
      aria-labelledby={`${project.id}-title`}
      variants={REVEAL.card} initial={reduceMotion ? false : "hidden"}
      whileInView="visible" viewport={VIEWPORT.standard}
      className="mb-3 break-inside-avoid overflow-hidden rounded-lg border border-border bg-background"
    >
      {project.thumbnail && (
        project.url ? <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <img src={project.thumbnail} alt={`${project.title} — verified public interface`} loading="lazy" decoding="async" className="block h-auto w-full" />
        </a> : <img src={project.thumbnail} alt={`${project.title} interface`} loading="lazy" decoding="async" className="block h-auto w-full" />
      )}
      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded border border-border bg-secondary/30 px-2 py-0.5 text-primary">{project.status}</span>
          {project.year && <span>{project.year}</span>}
          {project.warning && <span className="inline-flex items-center gap-1 text-primary"><AlertCircle className="h-3 w-3" aria-hidden="true" />Data population · review flag</span>}
        </div>
        <h3 id={`${project.id}-title`} className="font-display text-lg font-bold leading-snug text-foreground">
          {project.url ? <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{project.title}</a> : project.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">{project.keywords.slice(0, 3).map((keyword) => <span key={keyword} className="tag max-w-full whitespace-normal break-words px-2 py-0.5 text-xs">{keyword}</span>)}</div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
          {project.url && <Button asChild variant="ghost" size="sm" className="h-9 gap-1.5 px-2 text-xs"><a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.ctaLabel}: ${project.title}`}>{project.ctaLabel}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></Button>}
          <Button variant="ghost" size="sm" className="ml-auto h-9 gap-1.5 px-2 text-xs" aria-expanded={expanded} aria-controls={detailsId} aria-label={`${expanded ? "Hide" : "Show"} details: ${project.title}`} onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Less" : "Details"}<ChevronDown className={`h-3.5 w-3.5 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
          </Button>
        </div>
        <div id={detailsId} hidden={!expanded} className="mt-2 space-y-3 border-t border-border pt-3">
          <p className="text-sm leading-relaxed text-muted-foreground">{project.descriptor}</p>
          <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">{project.keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}</ul>
          {project.warning && <p className="border-l-2 border-primary/40 pl-3 text-xs leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Data population · review flag. </span>{project.warning}</p>}
          {project.sourceNote && <p className="text-xs text-muted-foreground">{project.sourceNote}</p>}
        </div>
      </div>
    </motion.article>
  );
}

export function AiPortfolioSection() {
  return (
    <section id="portfolio" className="section-spacing bg-card relative" aria-labelledby="portfolio-title">
      <div className="section-container">
        <AnimatedSection><h2 id="portfolio-title" className="section-title">Portfolio</h2></AnimatedSection>
        {aiProjectGroups.map((group) => (
          <div key={group.id} className="mb-12 last:mb-0">
            <h3 id={group.id} className="mb-4 text-xs font-semibold uppercase text-muted-foreground">{group.label}</h3>
            <div className="columns-1 gap-3 sm:columns-2" aria-labelledby={group.id}>
              {group.projects.map((project) => <AiProjectCard key={project.id} project={project} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
