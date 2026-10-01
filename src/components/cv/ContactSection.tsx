import { useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { useCvData } from "@/contexts/useCvData";
import "@/styles/navigation-contact.css";

const ContactSection = () => {
  const { data } = useCvData();
  const { email, location, links } = data.contact;
  const [exporting, setExporting] = useState(false);

  const handleDownloadJsonResume = async () => {
    if (exporting) return;
    setExporting(true);

    try {
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
    } catch (error) {
      console.error("JSON Resume export failed", error);
      window.alert("Could not export JSON Resume. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section id="contact" className="contact-section" data-sc-act="flow" aria-labelledby="contact-title">
      <div className="contact-section__inner">
        <h2 id="contact-title" className="contact-section__label">Contact</h2>

        <div className="contact-section__introduction">
          <h3>Let's work<br className="contact-section__heading-break" /> together</h3>
          <p>
            Available for freelance compositing, VFX, and animation projects.
            Feel free to reach out.
          </p>
        </div>

        <a className="contact-section__email" href={`mailto:${email}`}>
          <span>{email}</span>
          <ArrowUpRight aria-hidden="true" />
        </a>

        <div className="contact-section__details">
          <p className="contact-section__location">{location}</p>
          <div className="contact-section__destinations">
            {links.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
                <ArrowUpRight aria-hidden="true" />
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={handleDownloadJsonResume}
            disabled={exporting}
            aria-busy={exporting}
            className="contact-section__download"
          >
            Download JSON Resume
            <Download aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
