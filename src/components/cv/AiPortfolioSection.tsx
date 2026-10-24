import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ExternalLink, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aiProjectGroups, aiProjects } from "@/data/aiProjects";
import { emptyProjectFilters, matchesProjectFilters, projectFilterOptions, type ProjectFilters } from "@/data/aiProjectFilters";
import { REVEAL, VIEWPORT } from "@/lib/motion";
import AnimatedSection from "./AnimatedSection";

function AiProjectCard({ project, announce }: { project: (typeof aiProjects)[number]; announce: (message: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const detailsId = useId();
  const previewKeywords = [...new Set(project.keywords)].slice(0, 3);
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
      <Collapsible open={expanded} onOpenChange={(value) => {
        setExpanded(value);
        announce(`${project.title}: details ${value ? "expanded" : "collapsed"}.`);
      }} className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded border border-border bg-secondary/30 px-2 py-0.5 text-primary">{project.status}</span>
          {project.year && <span>{project.year}</span>}
          {project.warning && !expanded && <span className="inline-flex items-center gap-1 text-primary"><AlertCircle className="h-3 w-3" aria-hidden="true" />Data population · review flag</span>}
        </div>
        <h3 id={`${project.id}-title`} className="font-display text-lg font-bold leading-snug text-foreground">
          {project.url ? <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{project.title}</a> : project.title}
        </h3>
        {!expanded && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>}
        <div className="mt-2.5 flex flex-wrap gap-1.5">{previewKeywords.map((keyword) => <span key={keyword} className="tag max-w-full whitespace-normal break-words px-2 py-0.5 text-xs">{keyword}</span>)}</div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
          {project.url && <Button asChild variant="ghost" size="sm" className="h-9 gap-1.5 px-2 text-xs"><a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.ctaLabel}: ${project.title}`}>{project.ctaLabel}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></Button>}
          <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="ml-auto min-h-11 gap-1.5 px-2 text-xs focus-visible:ring-2 focus-visible:ring-ring" aria-controls={detailsId} aria-label={`Details: ${project.title}`}>
            {expanded ? "Less" : "Details"}<ChevronDown className={`h-3.5 w-3.5 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
          </Button></CollapsibleTrigger>
        </div>
        <CollapsibleContent forceMount id={detailsId} hidden={!expanded} role="region" aria-labelledby={`${project.id}-title`} className="mt-2 space-y-3 border-t border-border pt-3">
          <p className="text-sm leading-relaxed text-muted-foreground">{project.descriptor}</p>
          {project.keywords.some((keyword) => !previewKeywords.includes(keyword)) && <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">{[...new Set(project.keywords)].filter((keyword) => !previewKeywords.includes(keyword)).map((keyword) => <li key={keyword}>{keyword}</li>)}</ul>}
          {project.warning && <p className="border-l-2 border-primary/40 pl-3 text-xs leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Data population · review flag. </span>{project.warning}</p>}
          {project.sourceNote && <p className="text-xs text-muted-foreground">{project.sourceNote}</p>}
        </CollapsibleContent>
      </Collapsible>
    </motion.article>
  );
}

export function AiPortfolioSection() {
  const [filters, setFilters] = useState<ProjectFilters>(emptyProjectFilters);
  const [announcement, setAnnouncement] = useState("");
  const groups = aiProjectGroups.map((group) => ({ ...group, projects: group.projects.filter((project) => matchesProjectFilters(project, filters)) }));
  const count = groups.reduce((total, group) => total + group.projects.length, 0);
  const filtered = Object.values(filters).some((value) => value !== "all");
  const updateFilters = (next: ProjectFilters) => {
    setFilters(next);
    const matches = aiProjects.filter((project) => matchesProjectFilters(project, next)).length;
    setAnnouncement(`${matches} of ${aiProjects.length} projects shown.`);
  };
  return (
    <section id="portfolio" className="section-spacing bg-card relative" aria-labelledby="portfolio-title">
      <div className="section-container">
        <AnimatedSection><h2 id="portfolio-title" className="section-title">Portfolio</h2></AnimatedSection>
        <div role="group" aria-label="Project filters" className="mb-8 flex flex-wrap items-center gap-2 border-y border-border py-3">
          {(["skill", "technology", "type"] as const).map((key) => (
            <Select key={key} value={filters[key]} onValueChange={(value) => updateFilters({ ...filters, [key]: value })}>
              <SelectTrigger aria-label={key === "type" ? "Project type" : key === "skill" ? "Skill" : "Technology"} className="min-h-11 w-full text-xs sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{key === "type" ? "All project types" : key === "skill" ? "All skills" : "All technologies"}</SelectItem>
                {projectFilterOptions[key].map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
          {filtered && <Button variant="ghost" size="sm" className="min-h-11 gap-1.5 text-xs" onClick={() => updateFilters(emptyProjectFilters)}><X className="h-3.5 w-3.5" aria-hidden="true" />Clear filters</Button>}
          <span className="ml-auto text-xs text-muted-foreground">{count} / {aiProjects.length} projects</span>
        </div>
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</p>
        {count === 0 && <p className="py-6 text-sm text-muted-foreground">No matching projects.</p>}
        {groups.filter((group) => group.projects.length > 0).map((group) => (
          <div key={group.id} className="mb-12 last:mb-0">
            <h3 id={group.id} className="mb-4 text-xs font-semibold uppercase text-muted-foreground">{group.label}</h3>
            <div className="columns-1 gap-3 sm:columns-2" aria-labelledby={group.id}>
              {group.projects.map((project) => <AiProjectCard key={project.id} project={project} announce={setAnnouncement} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
