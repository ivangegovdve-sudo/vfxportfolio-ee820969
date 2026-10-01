import { lazy, Suspense } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import Navigation from "@/components/cv/Navigation";
import HeroSection from "@/components/cv/HeroSection";
import ExperienceSection from "@/components/cv/ExperienceSection";
import PortfolioSection from "@/components/cv/PortfolioSection";
import SkillsSection from "@/components/cv/SkillsSection";
import EducationSection from "@/components/cv/EducationSection";
import ContactSection from "@/components/cv/ContactSection";
import { useActiveSectionTracker } from "@/hooks/useActiveSectionTracker";
import { usePublishedCv } from "@/hooks/usePublishedCv";
import { usePortfolioDepth } from "@/hooks/usePortfolioDepth";

const ContentEditor = lazy(() => import("@/components/editor/ContentEditor"));

const Index = () => {
  const [searchParams] = useSearchParams();
  const { slug } = useParams();
  const isEditMode = searchParams.get("edit") === "true" || import.meta.env.VITE_ENABLE_EDITOR === "true";
  usePublishedCv(slug);
  useActiveSectionTracker();
  usePortfolioDepth();

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      {isEditMode && <Suspense fallback={null}><ContentEditor /></Suspense>}
      <Navigation />
      <main id="main" tabIndex={-1}>
        <HeroSection />
        <PortfolioSection />
        <ExperienceSection />
        <SkillsSection />
        <EducationSection />
        <ContactSection />
      </main>
      <footer className="portfolio-footer">
        <div className="section-container footer-content">
          <p>(c) {new Date().getFullYear()} - Built with care</p>
          <p>All trademarks and brand names are the property of their respective owners. Project references are presented for portfolio purposes only.</p>
          <Link to="/admin" aria-label="Admin sign in" className="footer-admin"><Lock size={14} aria-hidden="true" /></Link>
        </div>
      </footer>
    </>
  );
};

export default Index;
