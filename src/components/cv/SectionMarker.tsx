import AnimatedSection from "./AnimatedSection";

interface SectionMarkerProps {
  /** Two-digit editorial index, e.g. "01" */
  index: string;
  title: string;
  /** id applied to the heading for aria-labelledby */
  headingId: string;
}

/** Editorial section marker — mono index, gold tick, small-caps title */
const SectionMarker = ({ index, title, headingId }: SectionMarkerProps) => (
  <AnimatedSection>
    <div className="mb-12 flex items-center gap-4">
      <span
        className="text-[10px] text-muted-foreground/40"
        style={{ fontFamily: "var(--font-mono)" }}
        aria-hidden="true"
      >
        {index}
      </span>
      <div
        className="h-px max-w-[3rem] flex-1"
        style={{ background: "hsl(42 88% 56% / 0.3)" }}
        aria-hidden="true"
      />
      <h2 id={headingId} className="section-title mb-0">
        {title}
      </h2>
    </div>
  </AnimatedSection>
);

export default SectionMarker;
