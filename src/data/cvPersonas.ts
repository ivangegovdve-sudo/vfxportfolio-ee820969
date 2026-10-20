import aiResume from "./aiResume.json";
import type { CVData } from "./cvData";

export type CvPersona = "animation" | "ai";

export function getCvPersona(value: string | null): CvPersona {
  return value === "ai" ? "ai" : "animation";
}

export function personaSearchParams(current: URLSearchParams, persona: CvPersona) {
  const next = new URLSearchParams(current);
  next.set("v", persona);
  return next;
}

const formatDate = (value: string) => {
  const [year, month] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(month) - 1] ?? ""} ${year}`.trim();
};

export function aiCvData(animation: CVData): CVData {
  return {
    hero: {
      name: aiResume.basics.name,
      title: aiResume.basics.label,
      subtitle: aiResume.work[0].summary,
      photoUrl: animation.hero.photoUrl,
    },
    about: { paragraphs: [aiResume.basics.summary] },
    experience: aiResume.work.map((work, index) => ({
      id: `ai-work-${index}`, role: work.position, company: work.name,
      location: work.location, startDate: formatDate(work.startDate), endDate: "Present",
      description: work.summary, highlights: work.highlights,
    })),
    portfolio: aiResume.projects.map((project, index) => ({
      id: `ai-project-${index}`, order: index, title: project.name,
      descriptor: project.description, url: "url" in project ? project.url : "",
      thumbnail: "", ctaLabel: "View project", keywords: project.keywords,
      year: "startDate" in project && project.startDate ? project.startDate.slice(0, 4) : "",
    })),
    skills: {
      sections: aiResume.skills.map((skill) => ({
        title: skill.name, groups: [{ category: "", skills: skill.keywords }],
      })),
      personal: [],
    },
    languages: aiResume.languages.map((language) => ({
      language: language.language, proficiency: language.fluency,
      level: language.fluency === "Native" ? 5 : language.fluency.startsWith("C1") ? 4 : language.fluency.startsWith("B2") ? 3 : 1,
    })),
    education: aiResume.education.map((education, index) => ({
      id: `ai-education-${index}`, degree: education.area, institution: education.institution,
      startDate: formatDate(education.startDate), endDate: formatDate(education.endDate),
    })),
    contact: {
      email: aiResume.basics.email,
      location: `${aiResume.basics.location.city}, ${aiResume.basics.location.region}`,
      website: aiResume.basics.url,
      links: aiResume.basics.profiles.map((profile) => ({ label: profile.network, url: profile.url })),
    },
  };
}

export { aiResume };