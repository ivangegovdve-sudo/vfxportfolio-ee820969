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
      <div className="section-container h-14 flex items-center overflow-x-auto">
        <ul className="flex items-center gap-2 md:gap-3 min-w-max md:min-w-0 md:w-full md:justify-evenly py-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-flex items-center justify-center px-3 sm:px-4 md:px-6 py-2 rounded-full text-xs sm:text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 whitespace-nowrap"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
};

export default Navigation;
