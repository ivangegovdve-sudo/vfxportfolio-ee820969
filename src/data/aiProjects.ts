import aiResume from "./aiResume.json";

type SourceProject = (typeof aiResume.projects)[number];
type AssetPointer = { url: string };

// Uploaded screenshots are registered by their original filename, never guessed URLs.
const screenshots = import.meta.glob<AssetPointer>("../assets/cv-screenshots/*.asset.json", {
  eager: true,
  import: "default",
});

export function publicProjectLink(project: SourceProject) {
  if (project.url && (project.urlType === "live" || project.urlType === "public source repository")) {
    return { url: project.url, label: project.urlType === "live" ? "View project" : "View source" };
  }
  if ("repository" in project && project.repository && project.repositoryType === "public source repository") {
    return { url: project.repository, label: "View source" };
  }
  return undefined;
}

export const aiProjects = aiResume.projects.map((project, index) => {
  const filename = project.screenshot?.split("/").pop();
  const screenshot = filename ? screenshots[`../assets/cv-screenshots/${filename}.asset.json`] : undefined;
  const link = publicProjectLink(project);
  return {
    id: `ai-project-${index}`, order: index, title: project.name,
    descriptor: project.description, url: link?.url ?? "", ctaLabel: link?.label,
    thumbnail: screenshot?.url ?? "", keywords: project.highlights,
    year: project.startDate.slice(0, 4), status: project.status,
    sourceNote: project.urlType === "private source only" || project.urlType === "no production URL" ? project.urlType : "",
    warning: "dataQualityFlag" in project ? project.dataQualityFlag : undefined,
  };
});

export const isDeployedStatus = (status: string) => status === "deployed" || status === "deployed route";

export const aiProjectGroups = [
  { id: "ai-projects-live", label: "Deployed and live", projects: aiProjects.filter((p) => isDeployedStatus(p.status)) },
  { id: "ai-projects-dev", label: "In development", projects: aiProjects.filter((p) => !isDeployedStatus(p.status)) },
];

// Download only public CV content, not local source paths or withheld URL audit records.
export const aiResumeExport = {
  $schema: aiResume.$schema,
  basics: aiResume.basics,
  work: aiResume.work,
  education: aiResume.education,
  languages: aiResume.languages,
  skills: aiResume.skills,
  projects: aiResume.projects.map((project) => {
    const link = publicProjectLink(project);
    return {
      name: project.name, startDate: project.startDate, description: project.description,
      highlights: project.highlights, status: project.status,
      ...(link ? { url: link.url } : {}),
      ...("dataQualityFlag" in project ? { dataQualityFlag: project.dataQualityFlag } : {}),
    };
  }),
};