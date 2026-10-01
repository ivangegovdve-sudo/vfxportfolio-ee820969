import { type ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Essential CV copy stays readable from the first paint, including fast scrolls.
const AnimatedSection = ({ children, className = "" }: AnimatedSectionProps) => (
  <div className={className}>{children}</div>
);

export default AnimatedSection;
