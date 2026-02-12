import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/cv/Navigation";
import HeroSection from "@/components/cv/HeroSection";
import ExperienceSection from "@/components/cv/ExperienceSection";
import PortfolioSection from "@/components/cv/PortfolioSection";
import SkillsSection from "@/components/cv/SkillsSection";
import EducationSection from "@/components/cv/EducationSection";
import ContactSection from "@/components/cv/ContactSection";

const ContentEditor = lazy(() => import("@/components/editor/ContentEditor"));

const Index = () => {
  const [searchParams] = useSearchParams();
  const isEditMode =
    searchParams.get("edit") === "true" || import.meta.env.VITE_ENABLE_EDITOR === "true";

  return (
    <>
      {isEditMode && (
        <Suspense fallback={null}>
          <ContentEditor />
        </Suspense>
      )}
      <Navigation />
      <main id="main">
        <HeroSection />
        <PortfolioSection />
        <SkillsSection />
        <ExperienceSection />
        <EducationSection />
        <ContactSection />
      </main>
      <footer className="section-container py-8 text-center">
        <p className="text-xs text-muted-foreground">(c) {new Date().getFullYear()} - Built with care</p>
        <p className="mt-2 text-xs text-muted-foreground">
          All trademarks and brand names are the property of their respective owners. Project references are presented for portfolio purposes only.
        </p>
      </footer>
    </>
  );
};

export default Index;
