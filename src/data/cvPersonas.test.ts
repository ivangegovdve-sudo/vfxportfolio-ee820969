import { describe, expect, it } from "vitest";
import defaultCvData from "./cvData";
import { aiCvData, animationCvData, aiResume, getCvPersona, personaSearchParams } from "./cvPersonas";
import { aiProjectGroups, aiProjects, aiResumeExport } from "./aiProjects";
import { validateJsonResume } from "@/utils/jsonResume/validateJsonResume";
import { mapCvDataToJsonResume } from "@/utils/jsonResume/mapCvDataToJsonResume";

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
    expect(ai.skills.sections).toHaveLength(7);
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

  it("describes GymScholar as a training app, not a paper-reading app", () => {
    const project = aiResume.projects.find((p) => p.name === "GymScholar");
    expect(project?.description).toContain("workout routines");
    expect(project?.description).toContain("custom schedules and rest/break intervals");
    expect(project?.description).toContain("targeting specific muscle groups");
    expect(project?.description).toContain("peer-reviewed exercise science papers");
    expect(project?.description).toContain("rather than gym lore or bro-science");
    expect(project?.description.toLowerCase()).not.toContain("reading papers");
    expect(project?.description.toLowerCase()).not.toContain("training research app");
    expect(project?.highlights).toEqual([
      "Workout routine builder",
      "Custom schedules",
      "Rest/break intervals",
      "Muscle group targeting",
      "Peer-reviewed evidence base",
    ]);
  });

  it("describes Open Dashboard as an npm MCP server first, with the web dashboard as companion", () => {
    const project = aiResume.projects.find((p) => p.name === "Open Dashboard");
    expect(project?.description).toContain("MCP server published on npm as open-dashboard-mcp");
    expect(project?.description).toContain("thousands of downloads");
    expect(project?.description).toContain("model capabilities, provider pricing and adapters");
    expect(project?.description).toContain("integrates with the Model Router");
    expect(project?.description).toContain("companion interface");
    expect(project?.highlights).toContain("npm: open-dashboard-mcp");
    expect(project?.highlights).toContain("Model Router integration");
    expect(project?.highlights).toContain("Companion web dashboard");
    expect(project?.url).toBe("https://opendashboard.sdforest.site/");
  });

  it("describes 3D Repo Shelf as a hand-curated library of about 1,500 broadly useful repos", () => {
    const project = aiResume.projects.find((p) => p.name === "3D Repo Shelf");
    expect(project?.description).toContain("hand-curated catalog of around 1,500 useful GitHub repositories");
    expect(project?.description).toContain("picked one by one rather than scraped or filtered by topic");
    expect(project?.description).toContain("not AI-related at all");
    expect(project?.description).toContain("interactive 3D bookshelf");
    expect(project?.highlights).toContain("Hand-picked catalog of ~1,500 repos");
    expect(project?.highlights).toContain("Broadly useful tools, not AI-only");
    expect(project?.highlights).toContain("Interactive 3D bookshelf");
    expect(project?.url).toBe("https://ivangegovdve-sudo.github.io/repo-shelf/");
    expect(project?.description).not.toContain("Explore Repos");
    expect(aiResumeExport.projects.find((p) => p.name === "3D Repo Shelf")?.description).not.toContain("Explore Repos");
    expect(JSON.stringify(aiResumeExport).toLowerCase()).not.toContain("explore repos");
  });

  it("describes MoneyWolf as reading live market data while staying paper-only behind risk gates", () => {
    const project = aiResume.projects.find((p) => p.name === "MoneyWolf");
    expect(project?.description).toContain("read live sources");
    expect(project?.description).toContain("stock market data and crypto market data");
    expect(project?.description).toContain("Risk gates stay in force");
    expect(project?.description).toContain("read-only and paper-only");
    expect(project?.description).toContain("does not place real orders");
    expect(project?.highlights).toContain("Live stock and crypto market data");
    expect(project?.highlights).toContain("Risk gates");
    expect(project?.highlights).toContain("Paper trading");
    expect(project?.url).toBe("https://moneywolf.sdforest.site/");
  });

  it("describes Glass PR Solver as end-to-end PR automation with cross-model agreement before auto-merge", () => {
    const project = aiResume.projects.find((p) => p.name === "Glass PR Solver");
    expect(project?.description).toContain("takes a PR all the way to merged");
    expect(project?.description).toContain("must agree before it is approved");
    expect(project?.description).toContain("merged automatically");
    expect(project?.description).toContain("rebases the branch");
    expect(project?.description).toContain("addresses requested changes");
    expect(project?.description).toContain("fixes failing CI");
    expect(project?.description).toContain("looping until the work is done");
    expect(project?.description).toContain("asks for human help");
    expect(project?.highlights).toEqual([
      "End-to-end PR automation",
      "Cross-model agreement before approval",
      "Auto-merge",
      "Rebasing and looping until done",
      "Addresses requested changes",
      "Fixes failing CI",
      "GitHub API",
      "Human escalation",
    ]);
    expect(project?.url).toBeNull();
    expect(project?.status).toBe("in development");
  });

  it("uses the canonical short hero summary", () => {
    expect(aiCvData(defaultCvData).hero.subtitle).toBe("AI systems builder shipping agent orchestration, source-grounded research, retrieval and memory, voice interfaces, and full-stack public products.");
  });

  it("curates the fourteen project identities in source order", () => {
    expect(aiProjects.map((p) => p.title)).toEqual([
      "The Drop", "SD Forest / Forest HUB", "GymScholar", "Open Dashboard", "3D Repo Shelf",
      "MoneyWolf", "Avatar Playground / Voice Playground", "Audiobook Studio",
      "Dyslexia Reading Platform", "Women's Health OS", "Glass Mem", "Glass Council", "Glass PR Solver", "Cognitive Autonomy / Firsthand",
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
    expect(aiProjects.find((p) => p.title === "Audiobook Studio")?.url).toBe("https://chloe.blumenkraft.cloud/audiobook/");
    expect(aiProjects.find((p) => p.title === "Dyslexia Reading Platform")?.url).toBe("https://chloe.blumenkraft.cloud/dyslexia/");
    expect(aiProjects.some((p) => p.title.includes("Unified Reader"))).toBe(false);
  });

  it("groups deployed products before in-development systems", () => {
    const [live, dev] = aiProjectGroups;
    expect(live.projects.every((p) => p.status === "deployed" || p.status === "deployed route")).toBe(true);
    expect(live.projects).toHaveLength(9);
    expect(dev.projects.map((p) => p.title)).toEqual(["Women's Health OS", "Glass Mem", "Glass Council", "Glass PR Solver", "Cognitive Autonomy / Firsthand"]);
  });

  it("folds research skills into memory and drops filler and CaveMem", () => {
    const names = aiResume.skills.map((s) => s.name);
    expect(names).not.toContain("Research and knowledge products");
    const memory = aiResume.skills.find((s) => s.name === "Memory, retrieval and data systems")!.keywords;
    for (const k of ["PDF/EPUB document ingestion", "LlamaParse", "Evidence-linked retrieval", "Glass Mem", "SQLite FTS5", "LanceDB", "RAG"]) expect(memory).toContain(k);
    const publicText = JSON.stringify([aiResume.skills, aiResume.work]);
    for (const k of ["CaveMem", "Corpus freshness checks", "Health knowledge products", "Training knowledge products"]) expect(publicText).not.toContain(k);
  });

  it("removes DreamGraph from source data, portfolio and public resume", () => {
    expect(JSON.stringify(aiResume).toLowerCase()).not.toContain("dreamgraph");
    expect(aiProjects.some((p) => p.title === "DreamGraph")).toBe(false);
    expect(aiResumeExport.projects.some((p) => p.name === "DreamGraph")).toBe(false);
  });

  it("uses Firsthand's supplied live link without changing its development status", () => {
    const project = aiProjects.find((p) => p.title === "Cognitive Autonomy / Firsthand");
    expect(project?.url).toBe("https://firsthand.sdforest.site/");
    expect(project?.status).toBe("in development");
    expect(project?.ctaLabel).toBe("View project");
    expect(aiResumeExport.projects.find((p) => p.name === "Cognitive Autonomy / Firsthand")?.url).toBe("https://firsthand.sdforest.site/");
  });

  it("keeps the animator's default skills focused on animation and VFX", () => {
    expect(defaultCvData.skills.sections.map((s) => s.title)).toEqual([
      "Animation & VFX", "Production & Optimization", "Tools & Workflow", "Additional Software",
    ]);
    const skills = defaultCvData.skills.sections.flatMap((s) => s.groups.flatMap((g) => g.skills));
    for (const skill of ["Stable Diffusion", "ComfyUI", "ControlNet", "RAG", "LLMs", "Claude Code", "Ollama"]) {
      expect(skills).not.toContain(skill);
    }
  });

  it("excludes animator AI skills from old snapshots and their public exports without changing stored data", () => {
    const oldSnapshot = structuredClone(defaultCvData);
    oldSnapshot.skills.sections.push({ title: "AI & Emerging Tools", groups: [{ category: "", skills: ["ComfyUI", "RAG"] }] });
    const displayed = animationCvData(oldSnapshot);
    expect(displayed.skills.sections.some((s) => s.title === "AI & Emerging Tools")).toBe(false);
    expect(mapCvDataToJsonResume(displayed).skills?.some((s) => s.name === "AI & Emerging Tools")).toBe(false);
    expect(oldSnapshot.skills.sections.some((s) => s.title === "AI & Emerging Tools")).toBe(true);
    expect(displayed.experience).toEqual(defaultCvData.experience);
    expect(displayed.portfolio).toEqual(defaultCvData.portfolio);
    expect(aiCvData(oldSnapshot).skills.sections.flatMap((s) => s.groups.flatMap((g) => g.skills))).toContain("RunPod serverless GPU / ComfyUI");
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
