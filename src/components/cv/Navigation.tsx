import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-center h-14">
        {/* Desktop */}
        <ul className="hidden md:flex items-center justify-evenly w-full">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <div className="space-y-1.5">
            <span
              className={`block w-5 h-0.5 bg-foreground transition-transform ${
                mobileOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-foreground transition-opacity ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-foreground transition-transform ${
                mobileOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          id="mobile-navigation"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background/95 backdrop-blur-md border-b border-border"
        >
          <ul className="section-container py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navigation;
