import cvData from "@/data/cvData";
import { mapCvDataToJsonResume } from "@/utils/jsonResume/mapCvDataToJsonResume";
import { validateJsonResume } from "@/utils/jsonResume/validateJsonResume";

const FORBIDDEN_KEYS = ["thumbnail", "thumbnails", "imageurl", "ui", "ctalabel", "order"];

const collectForbiddenPaths = (value: unknown, path = "$"): string[] => {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectForbiddenPaths(item, `${path}[${index}]`));
  }

  const entries = Object.entries(value as Record<string, unknown>);
  const current = entries
    .filter(([key]) => FORBIDDEN_KEYS.some((needle) => key.toLowerCase().includes(needle)))
    .map(([key]) => `${path}.${key}`);

  const nested = entries.flatMap(([key, nestedValue]) =>
    collectForbiddenPaths(nestedValue, `${path}.${key}`)
  );

  return [...current, ...nested];
};

describe("JSON Resume export", () => {
  it("maps cvData and validates against schema", () => {
    const resume = mapCvDataToJsonResume(cvData);
    const validationResult = validateJsonResume(resume);

    if (!validationResult.ok) {
      throw new Error(validationResult.errors.join("\n"));
    }

    expect(validationResult.ok).toBe(true);
    expect(resume.basics?.name).toBe(cvData.hero.name);
    expect(resume.work?.length).toBeGreaterThan(0);
    expect(resume.skills?.length).toBeGreaterThan(0);
  });

  it("does not leak portfolio/UI-only keys into resume output", () => {
    const resume = mapCvDataToJsonResume(cvData);
    const forbiddenPaths = collectForbiddenPaths(resume);

    expect(forbiddenPaths).toEqual([]);
  });
});
