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
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: MOTION_TOKENS.durationMed, delay, ease: MOTION_TOKENS.easingDefault }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
