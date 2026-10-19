import { describe, expect, it } from "vitest";
import defaultCvData from "./cvData";
import { aiCvData, aiResume, getCvPersona, personaSearchParams } from "./cvPersonas";

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
    expect(ai.hero.title).toBe("AI Systems Builder · Agent Orchestration · RAG & Automation");
    expect(ai.portfolio.map((project) => project.title)).toEqual(aiResume.projects.map((project) => project.name));
    expect(ai.experience[0].highlights).toEqual(aiResume.work[0].highlights);
    expect(ai.skills.sections).toHaveLength(5);
    expect(ai.portfolio.find((project) => project.title === "Chloé Council")?.url).toBe("");
    expect(JSON.stringify(defaultCvData)).toBe(before);
  });
});