import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { MOTION_TOKENS } from "@/lib/motion";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection = ({ children, className = "", delay = 0 }: AnimatedSectionProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      layout={false}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: MOTION_TOKENS.durationSection, delay: 0, ease: MOTION_TOKENS.easingDefault }
      }
      style={reduceMotion ? undefined : { willChange: "opacity, transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
