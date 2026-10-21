import { describe, expect, it } from "vitest";
import defaultCvData from "./cvData";
import { aiCvData, aiResume, getCvPersona, personaSearchParams } from "./cvPersonas";
import { aiProjects, aiResumeExport } from "./aiProjects";
import { validateJsonResume } from "@/utils/jsonResume/validateJsonResume";

describe("CV personas", () => {
  it("defaults to animation and opens AI only for v=ai", () => {
    expect(getCvPersona(null)).toBe("animation");
    expect(getCvPersona("animation")).toBe("animation");
    expect(getCvPersona("invalid")).toBe("animation");
    expect(getCvPersona("ai")).toBe("ai");
  });

  it("shares either persona without dropping other URL settings", () => {
    const current = new URLSearchParams("edit=true&v=animation");
    expect(personaSearchParams(current, "ai").toString()).toBe("edit=true&v=ai");
    expect(personaSearchParams(current, "animation").get("v")).toBe("animation");
    expect(current.get("v")).toBe("animation");
  });

  it("uses uploaded AI content without mutating or borrowing animation achievements", () => {
    const before = JSON.stringify(defaultCvData);
    const ai = aiCvData(defaultCvData);
    expect(ai.hero.title).toBe("AI systems builder, orchestration and infrastructure");
    expect(ai.portfolio.map((project) => project.title)).toEqual(aiResume.projects.map((project) => project.name));
    expect(ai.experience[0].highlights).toEqual(aiResume.work[0].highlights);
    expect(ai.skills.sections).toHaveLength(8);
    expect(JSON.stringify(defaultCvData)).toBe(before);
  });

  it("keeps the AI portfolio honest and complete per the content rules", () => {
    const ai = aiCvData(defaultCvData);
    const titles = ai.portfolio.map((project) => project.title);
    expect(titles).toHaveLength(14);
    expect(titles.some((title) => title.includes("Lore Keeper"))).toBe(false);
    expect(titles).toContain("GymScholar");
    expect(ai.portfolio.find((project) => project.title === "GymScholar")?.year).toBe("2026");
  });

  it("uses the canonical short hero summary", () => {
    expect(aiCvData(defaultCvData).hero.subtitle).toBe("AI systems builder shipping agent orchestration, source-grounded research, retrieval and memory, voice interfaces, and full-stack public products.");
  });

  it("curates exactly the fourteen specified project identities in source order", () => {
    expect(aiProjects.map((p) => p.title)).toEqual([
      "The Drop", "SD Forest / Forest HUB", "GymScholar", "Open Dashboard", "3D Repo Shelf",
      "MoneyWolf", "Avatar Playground / Voice Playground", "Unified Reader + Audiobook Studio",
      "Women's Health OS", "Glass Mem", "Glass Council", "Glass PR Solver", "DreamGraph", "Cognitive Autonomy / Firsthand",
    ]);
    expect(aiResume.projects.filter((p) => p.screenshot)).toHaveLength(9);
  });

  it("retains the Women's Health population review warning", () => {
    const project = aiProjects.find((p) => p.title === "Women's Health OS");
    expect(project?.status).toBe("live route / in development");
    expect(project?.warning).toContain("zero-facts/zero-papers");
    expect(project?.warning).toContain("non-zero counters");
  });

  it("keeps native Glass Council and private-source systems linkless", () => {
    const council = aiProjects.find((p) => p.title === "Glass Council");
    expect(council?.keywords).toContain("Compose Multiplatform");
    expect(council?.keywords).toContain("Windows/Android UI");
    for (const title of ["Glass Council", "Glass Mem", "Glass PR Solver"]) {
      const project = aiProjects.find((p) => p.title === title);
      expect(project?.url).toBe("");
      expect(project?.status).toBe("in development");
    }
  });

  it("uses the current voice and combined reader routes exactly", () => {
    expect(aiProjects.find((p) => p.title === "Avatar Playground / Voice Playground")?.url).toBe("https://www.sdforest.site/web/avatar-playground/");
    expect(aiProjects.find((p) => p.title === "Unified Reader + Audiobook Studio")?.url).toBe("https://www.sdforest.site/web/pools/health/");
  });

  it.each([
    ["DreamGraph", "https://github.com/ivangegovdve-sudo/dreamgraph"],
    ["Cognitive Autonomy / Firsthand", "https://github.com/ivangegovdve-sudo/firsthand"],
  ])("links %s only as an in-development public source", (title, url) => {
    const project = aiProjects.find((p) => p.title === title);
    expect(project?.url).toBe(url);
    expect(project?.status).toBe("in development");
    expect(project?.ctaLabel).toBe("View source");
  });

  it("preserves the concrete implementation tools in v4 skills", () => {
    const skills = aiCvData(defaultCvData).skills.sections.flatMap((s) => s.groups.flatMap((g) => g.skills));
    for (const skill of ["Anthropic SDK", "Claude Agent SDK / CLI delegation", "Kotlin", "Cloudflare Workers module handlers", "RunPod serverless GPU / ComfyUI", "LanceDB", "Cartesia"]) {
      expect(skills).toContain(skill);
    }
  });

  it("exports valid public CV content without private audit paths or withheld URLs", () => {
    expect(validateJsonResume(aiResumeExport).ok).toBe(true);
    const exported = JSON.stringify(aiResumeExport);
    expect(exported).not.toContain("D:/");
    expect(exported).not.toContain("dist-omega");
    expect(exported).not.toContain("dreamgraph.nofs.ai");
    expect(aiResumeExport.projects.find((p) => p.name === "Glass PR Solver")).not.toHaveProperty("url");
  });
});
