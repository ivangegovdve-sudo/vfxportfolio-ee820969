import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/cv/Navigation";
import HeroSection from "@/components/cv/HeroSection";
import { Skeleton } from "@/components/ui/skeleton";

const AboutSection = lazy(() => import("@/components/cv/AboutSection"));
const ExperienceSection = lazy(() => import("@/components/cv/ExperienceSection"));
const PortfolioSection = lazy(() => import("@/components/cv/PortfolioSection"));
const SkillsSection = lazy(() => import("@/components/cv/SkillsSection"));
const EducationSection = lazy(() => import("@/components/cv/EducationSection"));
const ContactSection = lazy(() => import("@/components/cv/ContactSection"));
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
        <Suspense fallback={<Skeleton className="w-full h-8" />}>
          <AboutSection />
          <ExperienceSection />
          <PortfolioSection />
          <SkillsSection />
          <EducationSection />
          <ContactSection />
        </Suspense>
      </main>
      <footer className="section-container py-8 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} — Built with care
        </p>
      </footer>
    </>
  );
};

export default Index;
