import { ArrowUpRight, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCvData } from "@/contexts/useCvData";
import fallbackHeroPhoto from "@/data/assets/slackPic.webp";
import { resolvePhotoUrl } from "@/utils/resolvePhotoUrl";
import TrademarkText from "./TrademarkText";

const HeroSection = () => {
  const { data } = useCvData();
  const { name, title, subtitle, photoUrl } = data.hero;
  const reel = data.portfolio.find((item) => item.category?.toLowerCase() === "showreel")
    ?? data.portfolio.find((item) => item.type !== "collection");
  const resolvedPhoto = useMemo(() => resolvePhotoUrl(photoUrl, fallbackHeroPhoto), [photoUrl]);
  const [photo, setPhoto] = useState(resolvedPhoto);
  useEffect(() => setPhoto(resolvedPhoto), [resolvedPhoto]);

  return (
    <>
      <section id="hero" className="portfolio-hero" data-sc-act="flow" aria-labelledby="hero-heading">
        <div className="section-container">
          <p className="hero-role">{title}</p>
          <h1 id="hero-heading" className="hero-name">{name}<span className="hero-name-period" aria-hidden="true">.</span></h1>
          <div className="hero-lower">
            <div className="hero-introduction">
              <p className="hero-subtitle">{subtitle}</p>
              <div className="hero-actions">
                <a className="action-link" href="#experience">View Experience <ArrowUpRight aria-hidden="true" size={18} /></a>
                <a className="text-link" href="#contact">Get in Touch <ArrowUpRight aria-hidden="true" size={17} /></a>
              </div>
            </div>
            {reel && (
              <div className="hero-media-composition">
                <div className="hero-rear-frame" data-sc-parallax="-0.035" aria-hidden="true" />
                <div className="hero-media-plane" data-sc-parallax="0.018">
                  <a className="hero-reel" href={reel.url} target="_blank" rel="noopener noreferrer" aria-label={`${reel.ctaLabel || "Watch"} ${reel.title}`}>
                    <img src={reel.thumbnail} alt={reel.title} width={1280} height={720} loading="eager" fetchPriority="high" decoding="async" />
                    <span className="reel-play" aria-hidden="true"><Play fill="currentColor" size={24} /></span>
                  </a>
                  <div className="hero-reel-caption">
                    <div><span className="reel-title"><TrademarkText text={reel.title} /></span><span className="reel-descriptor">{reel.descriptor}</span></div>
                    <span className="reel-year">{[reel.category, reel.year].filter(Boolean).join(" / ")}</span>
                  </div>
                </div>
                <div className="hero-portrait-plane" data-sc-parallax="0.045">
                  <img src={photo} alt={name} width={100} height={120} onError={() => setPhoto(fallbackHeroPhoto)} decoding="async" />
                </div>
              </div>
            )}
            {!reel && (
              <img className="hero-portrait-only" src={photo} alt={name} width={240} height={288} onError={() => setPhoto(fallbackHeroPhoto)} />
            )}
          </div>
        </div>
      </section>
      <section className="biography-section" data-sc-act="flow" aria-labelledby="about-title">
        <div className="section-container biography-layout">
          <h2 id="about-title">About</h2>
          <div className="biography-copy">
            {data.about.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
