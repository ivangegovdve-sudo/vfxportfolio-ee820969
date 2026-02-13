export const TRACKED_SECTION_IDS = [
  "hero",
  "portfolio",
  "skills",
  "experience",
  "education",
  "contact",
] as const;

export type ActiveSectionId = (typeof TRACKED_SECTION_IDS)[number];
