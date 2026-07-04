import { useCvData } from "@/contexts/useCvData";
import AnimatedSection from "./AnimatedSection";
import SectionMarker from "./SectionMarker";
import { MapPin, ArrowUpRight, Download } from "lucide-react";

const ContactSection = () => {
  const { data } = useCvData();
  const { email, location, links } = data.contact;
  const handleDownloadJsonResume = async () => {
    const [{ mapCvDataToJsonResume }, { validateJsonResume }] = await Promise.all([
      import("@/utils/jsonResume/mapCvDataToJsonResume"),
      import("@/utils/jsonResume/validateJsonResume"),
    ]);

    const jsonResume = mapCvDataToJsonResume(data);
    const validationResult = validateJsonResume(jsonResume);
    if (!validationResult.ok) {
      console.error("JSON Resume validation failed", "errors" in validationResult ? validationResult.errors : []);
      window.alert("Could not export JSON Resume. Check console for validation details.");
      return;
    }

    const blob = new Blob([JSON.stringify(jsonResume, null, 2)], {
      type: "application/json",
    });
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = "resume.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const textLinkClass =
    "group inline-flex items-center gap-1.5 border-b border-white/10 pb-1 text-xs uppercase tracking-[0.14em] text-foreground/80 transition-[border-color,color] motion-medium hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <section
      id="contact"
      className="section-spacing relative overflow-hidden"
      aria-labelledby="contact-title"
    >
      {/* Ambient gold glow — bookends the hero treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[36vh] w-[70vw] -translate-x-1/2 opacity-15 blur-[110px]"
        style={{ background: "radial-gradient(ellipse, hsl(42 88% 56%), transparent 70%)" }}
      />

      <div className="section-container relative z-10">
        <SectionMarker index="05" title="Contact" headingId="contact-title" />

        <AnimatedSection delay={0.05}>
          <h3
            className="font-display font-extrabold leading-[1.04] tracking-tight text-foreground"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            Let&apos;s work together<span className="text-primary">.</span>
          </h3>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
            Available for freelance compositing, VFX, and animation projects.
            Feel free to reach out.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.12}>
          <a
            href={`mailto:${email}`}
            className="group mt-12 inline-flex items-baseline gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="border-b border-white/15 pb-1 font-display text-xl font-bold text-foreground transition-[border-color,color] motion-medium group-hover:border-primary group-hover:text-primary sm:text-2xl md:text-3xl">
              {email}
            </span>
            <ArrowUpRight
              className="h-5 w-5 shrink-0 self-center text-muted-foreground transition-[color,transform] motion-medium group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </a>

          <p className="mt-6 flex items-center gap-2.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {location}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div
            className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={textLinkClass}
              >
                {link.label}
                <ArrowUpRight
                  className="h-3 w-3 transition-transform motion-medium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            ))}
            <button type="button" onClick={handleDownloadJsonResume} className={textLinkClass}>
              Download JSON Resume
              <Download className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ContactSection;
