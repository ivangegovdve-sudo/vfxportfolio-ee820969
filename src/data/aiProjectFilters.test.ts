import { describe, expect, it } from "vitest";
import { aiProjects, aiProjectGroups } from "./aiProjects";
import { emptyProjectFilters, matchesProjectFilters, projectFacets } from "./aiProjectFilters";

const titles = (filters: typeof emptyProjectFilters) => aiProjects.filter((p) => matchesProjectFilters(p, filters)).map((p) => p.title);

describe("AI project filters", () => {
  it("covers every project and shows all fifteen with no filters", () => {
    expect(aiProjects.every((p) => Boolean(projectFacets[p.title]))).toBe(true);
    expect(titles(emptyProjectFilters)).toEqual(aiProjects.map((p) => p.title));
    expect(titles(emptyProjectFilters)).toHaveLength(15);
  });
  it("narrows by voice skill across live and development groups", () => {
    const filters = { ...emptyProjectFilters, skill: "Voice and audio" };
    expect(titles(filters)).toEqual(["The Drop", "Avatar Playground", "Open Voice Playground", "Audiobook Studio"]);
    expect(aiProjectGroups.map((g) => g.projects.filter((p) => matchesProjectFilters(p, filters)).length)).toEqual([3, 1]);
  });
  it("narrows by a concrete technology", () => {
    expect(titles({ ...emptyProjectFilters, technology: "MCP" })).toEqual(["Open Dashboard", "Glass Mem", "Glass Council"]);
  });
  it("narrows by project type", () => {
    expect(titles({ ...emptyProjectFilters, type: "Reading and listening app" })).toEqual(["Audiobook Studio", "Flexy Read"]);
  });
  it("intersects filters and permits an empty result without inventing technologies", () => {
    expect(titles({ skill: "Memory and retrieval", technology: "MCP", type: "MCP server" })).toEqual(["Glass Mem"]);
    expect(titles({ ...emptyProjectFilters, skill: "Voice and audio", technology: "Kotlin" })).toEqual([]);
    expect(projectFacets.GymScholar.technologies).toEqual([]);
  });
});