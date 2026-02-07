import { motion } from "framer-motion";
import { useCvData } from "@/contexts/CVDataContext";
import { User } from "lucide-react";

const HeroSection = () => {
  const { data } = useCvData();
  const { name, title, subtitle, photoUrl } = data.hero;

  return (
    <section className="hero-gradient min-h-[80vh] flex items-center pt-14">
      <div className="section-container w-full">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0"
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-40 h-40 md:w-52 md:h-52 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-secondary flex items-center justify-center border-4 border-primary/20 shadow-lg">
                <User className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground" />
              </div>
            )}
          </motion.div>

          {/* Text */}
          <div className="text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight"
            >
              {name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-3 text-lg md:text-xl font-display font-medium text-primary"
            >
              {title}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 text-base md:text-lg text-muted-foreground max-w-lg"
            >
              {subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start"
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get in Touch
              </a>
              <a
                href="#experience"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
              >
                View Experience
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
