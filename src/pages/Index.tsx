import Navigation from "@/components/cv/Navigation";
import HeroSection from "@/components/cv/HeroSection";
import AboutSection from "@/components/cv/AboutSection";
import ExperienceSection from "@/components/cv/ExperienceSection";
import PortfolioSection from "@/components/cv/PortfolioSection";
import SkillsSection from "@/components/cv/SkillsSection";
import EducationSection from "@/components/cv/EducationSection";
import ContactSection from "@/components/cv/ContactSection";
import ContentEditor from "@/components/editor/ContentEditor";

const Index = () => {
  return (
    <>
      <ContentEditor />
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <PortfolioSection />
        <SkillsSection />
        <EducationSection />
        <ContactSection />
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
