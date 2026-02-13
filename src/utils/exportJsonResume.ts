import type { CVData } from "@/data/cvData";

export type CvDataType = CVData;

export interface JsonResumeSchema {
  $schema?: string;
  basics?: {
    name?: string;
    label?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryCode?: string;
      region?: string;
    };
    profiles?: Array<{
      network?: string;
      username?: string;
      url?: string;
    }>;
  };
  work?: Array<{
    name?: string;
    position?: string;
    location?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  education?: Array<{
    institution?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    courses?: string[];
  }>;
  skills?: Array<{
    name?: string;
    level?: string;
    keywords?: string[];
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    highlights?: string[];
    url?: string;
    keywords?: string[];
  }>;
}

const MONTH_MAP: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

const COUNTRY_CODE_MAP: Record<string, string> = {
  bulgaria: "BG",
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  england: "GB",
  "united kingdom": "GB",
  uk: "GB",
  germany: "DE",
  france: "FR",
  spain: "ES",
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const parseMonthYear = (value: string | undefined): string | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const normalized = value.trim();
  if (/^present$/i.test(normalized)) {
    return undefined;
  }

  const yearOnly = normalized.match(/^(\d{4})$/);
  if (yearOnly) {
    return `${yearOnly[1]}-01-01`;
  }

  const monthYear = normalized.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);
  if (!monthYear) {
    return undefined;
  }

  const monthKey = monthYear[1].slice(0, 3).toLowerCase();
  const month = MONTH_MAP[monthKey];
  if (!month) {
    return undefined;
  }

  return `${monthYear[2]}-${month}-01`;
};

const extractUsernameFromUrl = (url: string): string | undefined => {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : undefined;
  } catch {
    return undefined;
  }
};

const normalizeProfileNetwork = (url: string): "LinkedIn" | "GitHub" | undefined => {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin.com")) {
    return "LinkedIn";
  }
  if (lower.includes("github.com")) {
    return "GitHub";
  }
  return undefined;
};

const getPortfolioUrl = (cvData: CVData): string | undefined => {
  if (isNonEmptyString(cvData.contact.website)) {
    return cvData.contact.website;
  }

  const showreel = cvData.portfolio.find((item) => item.id === "pf-showreel");
  if (showreel && isNonEmptyString(showreel.url)) {
    return showreel.url;
  }

  const firstPortfolioUrl = cvData.portfolio.find((item) => isNonEmptyString(item.url))?.url;
  return firstPortfolioUrl;
};

const mapLocation = (location: string | undefined) => {
  if (!isNonEmptyString(location)) {
    return undefined;
  }

  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return undefined;
  }

  const city = parts[0];
  const region = parts.length > 1 ? parts[parts.length - 1] : undefined;
  const countryCode = region ? COUNTRY_CODE_MAP[region.toLowerCase()] : undefined;

  return pruneUndefined({
    city,
    region,
    countryCode,
  });
};

const unique = (values: string[]): string[] => Array.from(new Set(values.filter(isNonEmptyString)));

const pruneUndefined = <T>(value: T): T => {
  if (Array.isArray(value)) {
    const cleanedArray = value
      .map((item) => pruneUndefined(item))
      .filter((item) => item !== undefined && item !== null) as unknown as T;
    return cleanedArray;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, pruneUndefined(entryValue)]);

    return Object.fromEntries(entries) as T;
  }

  return value;
};

export function mapCvDataToJsonResume(cvData: CvDataType): JsonResumeSchema {
  const contactData = cvData.contact as CVData["contact"] & { github?: string };

  const profileSources = [
    contactData.linkedin,
    contactData.github,
    ...contactData.links.map((link) => link.url),
  ].filter(isNonEmptyString);

  const profileByNetwork = new Map<string, { network: string; url: string; username?: string }>();
  for (const url of profileSources) {
    const network = normalizeProfileNetwork(url);
    if (!network || profileByNetwork.has(network)) {
      continue;
    }
    profileByNetwork.set(network, {
      network,
      url,
      username: extractUsernameFromUrl(url),
    });
  }

  const profiles = Array.from(profileByNetwork.values());

  const work = cvData.experience.map((item) =>
    pruneUndefined({
      name: item.company,
      position: item.role,
      location: item.location,
      url: item.links?.find((link) => isNonEmptyString(link.url))?.url,
      startDate: parseMonthYear(item.startDate),
      endDate: parseMonthYear(item.endDate),
      summary: item.description,
      highlights: unique([...(item.highlights ?? [])]),
    })
  );

  const education = cvData.education.map((item) =>
    pruneUndefined({
      institution: item.institution,
      area: item.degree,
      studyType: /course/i.test(item.degree) ? "Course" : "Education",
      startDate: parseMonthYear(item.startDate),
      endDate: parseMonthYear(item.endDate),
      courses: item.description ? [item.description] : undefined,
    })
  );

  const skillGroups = new Map<string, Set<string>>();
  for (const section of cvData.skills.sections) {
    for (const group of section.groups) {
      const groupName = isNonEmptyString(group.category) ? group.category : section.title;
      if (!skillGroups.has(groupName)) {
        skillGroups.set(groupName, new Set<string>());
      }

      for (const skill of group.skills) {
        if (isNonEmptyString(skill)) {
          skillGroups.get(groupName)?.add(skill);
        }
      }
    }
  }

  if (cvData.skills.personal.length > 0) {
    if (!skillGroups.has("Personal")) {
      skillGroups.set("Personal", new Set<string>());
    }
    for (const skill of cvData.skills.personal) {
      if (isNonEmptyString(skill)) {
        skillGroups.get("Personal")?.add(skill);
      }
    }
  }

  const skills = Array.from(skillGroups.entries()).map(([name, keywords]) =>
    pruneUndefined({
      name,
      level: "Advanced",
      keywords: unique(Array.from(keywords)),
    })
  );

  const projects = [...cvData.portfolio]
    .sort((a, b) => a.order - b.order)
    .map((item) =>
      pruneUndefined({
        name: item.title,
        description: item.descriptor,
        highlights: unique((item.games ?? []).map((game) => game.name)),
        url: item.url,
        keywords: unique([item.type ?? "project", item.category ?? "", item.year ?? ""]),
      })
    );

  const basics = pruneUndefined({
    name: cvData.hero.name,
    label: cvData.hero.title,
    email: contactData.email,
    phone: contactData.phone,
    url: getPortfolioUrl(cvData),
    summary: unique(cvData.about.paragraphs).join("\n\n"),
    location: mapLocation(contactData.location),
    profiles: profiles.length > 0 ? profiles : undefined,
  });

  const resume: JsonResumeSchema = pruneUndefined({
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json",
    basics,
    work: work.length > 0 ? work : undefined,
    education: education.length > 0 ? education : undefined,
    skills: skills.length > 0 ? skills : undefined,
    projects: projects.length > 0 ? projects : undefined,
  });

  return resume;
}
