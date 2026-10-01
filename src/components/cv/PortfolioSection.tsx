import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { useCvData } from "@/contexts/useCvData";
import TrademarkText from "./TrademarkText";
import RedTigerPosterRail from "./RedTigerPosterRail";

const PortfolioSection = () => {
  const { data } = useCvData();
  const items = [...data.portfolio].sort((a, b) => a.order - b.order);
  const projects = items.filter((item) => item.type !== "collection");
  const collections = items.filter((item) => item.type === "collection");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const active = projects.find((item) => item.id === selectedId) ?? projects[0];
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { buttonRefs.current = buttonRefs.current.slice(0, projects.length); }, [projects.length]);

  const selectProject = (index: number, moveFocus = false) => {
    const next = projects[index];
    if (!next) return;
    setSelectedId(next.id);
    if (moveFocus) {
      buttonRefs.current[index]?.focus({ preventScroll: true });
      buttonRefs.current[index]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    }
  };

  return (
    <section id="portfolio" className="work-section" data-sc-act="flow" aria-labelledby="portfolio-title">
      <div className="section-container">
        <div className="work-heading"><h2 id="portfolio-title" className="section-title">Portfolio</h2><span className="work-heading-rule" aria-hidden="true" /></div>
        {active && (
          <div className="work-projector">
            <div className="projector-image-wrap" data-sc-reveal="up" data-sc-reveal-at="0 0.16">
              <a href={active.url} target="_blank" rel="noopener noreferrer" className="projector-screen" aria-label={`${active.ctaLabel || "Watch"} ${active.title}`}>
                <img key={active.id} src={active.thumbnail} alt={active.title} width={1280} height={720} loading="lazy" decoding="async" />
                <span className="projector-play" aria-hidden="true"><Play fill="currentColor" size={24} /></span>
              </a>
            </div>
            <div id="projector-caption" className="projector-caption" aria-live="polite" aria-atomic="true">
              <div><h3><TrademarkText text={active.title} /></h3><p>{active.descriptor}</p></div>
              <div className="projector-caption-meta"><span>{[active.category, active.year].filter(Boolean).join(" / ")}</span><a href={active.url} target="_blank" rel="noopener noreferrer" className="text-link">{active.ctaLabel || "View"}<ArrowUpRight size={18} aria-hidden="true" /></a></div>
            </div>
            <div className="project-contact-sheet" role="group" aria-label="Select a portfolio project">
              {projects.map((item, index) => (
                <div className={`contact-sheet-item${active.id === item.id ? " is-selected" : ""}`} key={item.id}>
                  <button type="button" ref={(element) => { buttonRefs.current[index] = element; }} className="contact-sheet-select" aria-pressed={active.id === item.id} aria-controls="projector-caption" aria-label={`Select ${item.title}`} onClick={() => selectProject(index)} onKeyDown={(event) => {
                    let next: number | undefined;
                    if (event.key === "ArrowRight") next = (index + 1) % projects.length;
                    if (event.key === "ArrowLeft") next = (index - 1 + projects.length) % projects.length;
                    if (event.key === "Home") next = 0;
                    if (event.key === "End") next = projects.length - 1;
                    if (next !== undefined) { event.preventDefault(); selectProject(next, true); }
                  }}>
                    <img src={item.thumbnail} alt="" width={320} height={180} loading="lazy" decoding="async" />
                    <span className="sheet-selection-mark" aria-hidden="true" />
                  </button>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="sheet-project-link"><TrademarkText text={item.title} /><ArrowUpRight size={13} aria-hidden="true" /></a>
                  <p className="sheet-project-meta">{[item.year, item.category].filter(Boolean).join(" / ")}</p>
                  <p className="sheet-project-description">{item.descriptor}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {collections.map((item) => <RedTigerPosterRail item={item} key={item.id} />)}
      </div>
    </section>
  );
};

export default PortfolioSection;
