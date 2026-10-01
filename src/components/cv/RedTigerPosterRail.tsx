import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { PortfolioItem } from "@/data/cvData";
import TrademarkText from "./TrademarkText";
import gamePosterAssets from "@/data/gamePosterAssets";

const RedTigerPosterRail = ({ item }: { item: PortfolioItem }) => {
  const [selectedYear, setSelectedYear] = useState("all");
  const trackRef = useRef<HTMLDivElement>(null);
  const games = useMemo(() => item.games ?? [], [item.games]);
  const posters = games.filter((game) => game.posterUrl);
  const years = useMemo(() => [...new Set(games.map((game) => game.year).filter(Boolean))].sort().reverse(), [games]);
  const filteredGames = selectedYear === "all" ? games : games.filter((game) => game.year === selectedYear);
  const shiftRail = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: reduce ? "instant" : "smooth" });
  };

  return (
    <article className="game-collection" aria-labelledby={`${item.id}-title`}>
      <div className="collection-heading">
        <div className="collection-heading-main">
          <img className="collection-brand" src={item.thumbnail} alt="" width={320} height={100} loading="lazy" decoding="async" />
          <h3 id={`${item.id}-title`}><TrademarkText text={item.title} /></h3>
          <p className="collection-description">{item.descriptor}</p>
        </div>
        <div className="collection-heading-meta">
          <p>{[item.category, item.year].filter(Boolean).join(" / ")}</p>
          <a className="action-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.ctaLabel || "View"}<ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
      {posters.length > 0 && (
        <div data-red-tiger-sticky-wrapper className="game-banner-collection">
          <div className="banner-rail-controls">
            <button type="button" onClick={() => shiftRail(-1)} aria-label="Previous game posters" aria-controls={`${item.id}-posters`}><ArrowLeft size={19} aria-hidden="true" /></button>
            <button type="button" onClick={() => shiftRail(1)} aria-label="Next game posters" aria-controls={`${item.id}-posters`}><ArrowRight size={19} aria-hidden="true" /></button>
          </div>
          <div data-red-tiger-viewport className="game-banner-viewport">
            <div id={`${item.id}-posters`} ref={trackRef} data-red-tiger-track className="game-banner-track" role="group" aria-label="Red Tiger game posters">
              {posters.map((game) => (
                <a key={game.name} data-red-tiger-poster className="game-banner" href={game.url || item.url} target="_blank" rel="noopener noreferrer"
                  onFocus={(event) => {
                    const element = event.currentTarget;
                    const track = trackRef.current;
                    if (!track) return;
                    const left = element.offsetLeft - track.offsetLeft;
                    if (left < track.scrollLeft || left + element.clientWidth > track.scrollLeft + track.clientWidth) {
                      track.scrollTo({ left: Math.max(0, left), behavior: "instant" });
                    }
                  }}>
                  <img src={gamePosterAssets[game.posterUrl] || game.posterUrl} alt={game.name} width={2560} height={820} loading="lazy" decoding="async" onError={(event) => {
                    const image = event.currentTarget;
                    if (!image.dataset.fallback) { image.dataset.fallback = "true"; image.src = item.thumbnail; }
                  }} />
                  <div className="game-banner-caption"><span><TrademarkText text={game.name} /></span><span>{game.year}<ArrowUpRight size={15} aria-hidden="true" /></span></div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      {games.length > 0 && (
        <div className="released-games">
          <div className="games-list-heading">
            <h4>Released / Published games</h4>
            {years.length > 0 && (
              <div className="game-filter">
                <label htmlFor={`${item.id}-year-filter`}>Filter by year</label>
                <select id={`${item.id}-year-filter`} aria-label="Filter released games by year" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                  <option value="all">All years</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
            )}
          </div>
          <div id={`${item.id}-games`} className="games-ledger" aria-live="polite">
            {filteredGames.map((game) => (
              <div key={game.name} className="game-ledger-row">
                {game.url ? <a href={game.url} target="_blank" rel="noopener noreferrer"><TrademarkText text={game.name} /><ArrowUpRight size={14} aria-hidden="true" /></a> : <span><TrademarkText text={game.name} /></span>}
                <span className="game-ledger-year">{game.year}</span>
              </div>
            ))}
          </div>
          {filteredGames.length === 0 && <p className="games-empty">No released games found for this year.</p>}
        </div>
      )}
      <p className="collection-note">Published under the Red Tiger brand</p>
    </article>
  );
};

export default RedTigerPosterRail;
