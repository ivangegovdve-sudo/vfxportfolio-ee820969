import { aiProjects } from "./aiProjects";

export type ProjectFacets = { skills: string[]; technologies: string[]; type: string };
export type ProjectFilters = { skill: string; technology: string; type: string };
export const emptyProjectFilters: ProjectFilters = { skill: "all", technology: "all", type: "all" };

// Presentation-only facets grounded in the canonical project descriptions and highlights.
export const projectFacets: Record<string, ProjectFacets> = {
  "The Drop": { skills: ["Publishing", "Voice and audio"], technologies: ["TanStack Start", "TypeScript", "Supabase", "n8n", "OpenRouter", "Telegram"], type: "Publication" },
  "SD Forest / Forest HUB": { skills: ["Interactive graphics", "Research and evidence"], technologies: ["HTML/JavaScript", "FastAPI", "SQLite", "Three.js", "WebGL2", "Vercel"], type: "Web app" },
  "GymScholar": { skills: ["Workout planning", "Research and evidence"], technologies: [], type: "Web app" },
  "Open Dashboard": { skills: ["Model routing"], technologies: ["MCP", "npm", "Model Router"], type: "MCP server" },
  "3D Repo Shelf": { skills: ["Interactive graphics", "Repository curation"], technologies: ["React Three Fiber", "Three.js", "GitHub Pages"], type: "Catalog" },
  "MoneyWolf": { skills: ["Agent workflows", "Market research"], technologies: ["Python", "Node.js", "SQLite"], type: "Web app" },
  "Avatar Playground": { skills: ["Interactive graphics", "Voice and audio"], technologies: ["Browser audio"], type: "Playground" },
  "Open Voice Playground": { skills: ["Voice and audio", "Model training and inference"], technologies: ["Kokoro-82M", "StyleTTS2"], type: "Developer tool" },
  "Audiobook Studio": { skills: ["Document processing", "Voice and audio"], technologies: [], type: "Reading and listening app" },
  "Flexy Read": { skills: ["Accessible reading"], technologies: [], type: "Reading and listening app" },
  "Women's Health OS": { skills: ["Research and evidence"], technologies: ["FastAPI", "SQLite"], type: "Web app" },
  "Glass Mem": { skills: ["Memory and retrieval", "Agent workflows"], technologies: ["Python", "SQLite", "SQLite FTS5", "LanceDB", "MCP"], type: "MCP server" },
  "Glass Council": { skills: ["Model comparison", "Native app development"], technologies: ["Python", "Kotlin", "Compose Multiplatform", "MCP"], type: "Native app" },
  "Glass PR Solver": { skills: ["PR automation", "Model comparison"], technologies: ["GitHub API"], type: "Developer tool" },
  "Cognitive Autonomy / Firsthand": { skills: ["Research and evidence"], technologies: ["Python"], type: "Web app" },
};

const sortedUnique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));
export const projectFilterOptions = {
  skill: sortedUnique(Object.values(projectFacets).flatMap((p) => p.skills)),
  technology: sortedUnique(Object.values(projectFacets).flatMap((p) => p.technologies)),
  type: sortedUnique(Object.values(projectFacets).map((p) => p.type)),
};

export function matchesProjectFilters(project: (typeof aiProjects)[number], filters: ProjectFilters) {
  const facets = projectFacets[project.title];
  if (!facets) return Object.values(filters).every((value) => value === "all");
  return (filters.skill === "all" || facets.skills.includes(filters.skill))
    && (filters.technology === "all" || facets.technologies.includes(filters.technology))
    && (filters.type === "all" || facets.type === filters.type);
}