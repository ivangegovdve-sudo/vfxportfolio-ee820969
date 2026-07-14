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
      <footer className="section-container py-8 text-center">
        <p className="text-xs text-muted-foreground">(c) {new Date().getFullYear()} - Built with care</p>
        <p className="mt-2 text-xs text-muted-foreground/70 max-w-2xl mx-auto">
          All trademarks and brand names are the property of their respective owners. Project references are presented for portfolio purposes only.
        </p>
      </footer>
    </>
  );
};

export default Index;
