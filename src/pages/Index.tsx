import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/cv/Navigation";
import HeroSection from "@/components/cv/HeroSection";
import ExperienceSection from "@/components/cv/ExperienceSection";
import PortfolioSection from "@/components/cv/PortfolioSection";
import SkillsSection from "@/components/cv/SkillsSection";
import EducationSection from "@/components/cv/EducationSection";
import ContactSection from "@/components/cv/ContactSection";
import { useActiveSectionTracker } from "@/hooks/useActiveSectionTracker";

const ContentEditor = lazy(() => import("@/components/editor/ContentEditor"));

const PROGRAMMATIC_SCROLL_EVENT = "cv:programmatic-scroll-start";

const Index = () => {
  const [searchParams] = useSearchParams();
  const isEditMode =
    searchParams.get("edit") === "true" || import.meta.env.VITE_ENABLE_EDITOR === "true";
  useActiveSectionTracker();

  const [navFading, setNavFading] = useState(false);

  const handleAnimationEnd = useCallback(() => setNavFading(false), []);

  useEffect(() => {
    const handler = () => {
      setNavFading(false);
      requestAnimationFrame(() => setNavFading(true));
    };
    window.addEventListener(PROGRAMMATIC_SCROLL_EVENT, handler);
    return () => window.removeEventListener(PROGRAMMATIC_SCROLL_EVENT, handler);
  }, []);

  return (
    <>
      {isEditMode && (
        <Suspense fallback={null}>
          <ContentEditor />
        </Suspense>
      )}
      <Navigation />
      <main
        id="main"
        className={navFading ? "animate-nav-fadein" : ""}
        onAnimationEnd={handleAnimationEnd}
      >
        <HeroSection />
        <PortfolioSection />
        <SkillsSection />
        <ExperienceSection />
        <EducationSection />
        <ContactSection />
      </main>
      <footer className="border-t border-white/5">
        <div className="section-container flex flex-col gap-3 py-10 md:flex-row md:items-baseline md:justify-between">
          <p
            className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {"©"} {new Date().getFullYear()} {"—"} Built with care
          </p>
          <p className="max-w-xl text-[11px] leading-relaxed text-muted-foreground/60 md:text-right">
            All trademarks and brand names are the property of their respective owners. Project references are presented for portfolio purposes only.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Index;
