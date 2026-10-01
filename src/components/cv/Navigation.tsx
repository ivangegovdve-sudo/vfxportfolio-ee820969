import { useEffect, useMemo, useState } from "react";
import { useActiveSection } from "@/context/useActiveSection";
import type { ActiveSectionId } from "@/context/activeSectionIds";
import { useCvData } from "@/contexts/useCvData";
import "@/styles/navigation-contact.css";

type SectionNavItem = {
  id: ActiveSectionId;
  href: `#${ActiveSectionId}`;
  label: string;
  shortLabel: string;
};

const sectionNavItems: SectionNavItem[] = [
  { id: "hero", href: "#hero", label: "Home", shortLabel: "Home" },
  { id: "portfolio", href: "#portfolio", label: "Portfolio", shortLabel: "Work" },
  { id: "experience", href: "#experience", label: "Experience", shortLabel: "Exp" },
  { id: "skills", href: "#skills", label: "Skills", shortLabel: "Skills" },
  { id: "education", href: "#education", label: "Education", shortLabel: "Edu" },
  { id: "contact", href: "#contact", label: "Contact", shortLabel: "Contact" },
];

const PROGRAMMATIC_SCROLL_EVENT = "cv:programmatic-scroll-start";

const Navigation = () => {
  const { data } = useCvData();
  const { activeSection, setActiveSection } = useActiveSection();
  const [scrolled, setScrolled] = useState(false);
  const initials = useMemo(() => {
    const words = data.hero.name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    const first = Array.from(words[0])[0] ?? "";
    const last = words.length > 1 ? Array.from(words[words.length - 1])[0] ?? "" : "";
    return `${first}${last}`.toUpperCase();
  }, [data.hero.name]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (sectionId: ActiveSectionId) => {
    window.dispatchEvent(new CustomEvent(PROGRAMMATIC_SCROLL_EVENT));
    setActiveSection(sectionId);
  };

  return (
    <nav
      className={`portfolio-nav${scrolled ? " is-scrolled" : ""}`}
      aria-label="Portfolio navigation"
    >
      <div className="portfolio-nav__inner">
        <a
          className="portfolio-nav__identity"
          href="#hero"
          aria-label={`${data.hero.name}, home`}
          onClick={() => handleNavClick("hero")}
        >
          <span className="portfolio-nav__monogram" aria-hidden="true">{initials}</span>
          <span className="portfolio-nav__name">{data.hero.name}</span>
        </a>
        <ul className="portfolio-nav__links">
          {sectionNavItems.map((navItem) => (
            <li key={navItem.id}>
              <a
                href={navItem.href}
                aria-label={navItem.label}
                aria-current={activeSection === navItem.id ? "page" : undefined}
                onClick={() => handleNavClick(navItem.id)}
                className="portfolio-nav__link"
              >
                <span className="portfolio-nav__label" aria-hidden="true">{navItem.label}</span>
                <span className="portfolio-nav__short-label" aria-hidden="true">{navItem.shortLabel}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
