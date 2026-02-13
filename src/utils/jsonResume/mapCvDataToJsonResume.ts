import type { CVData, PortfolioItem } from "@/data/cvData";

type JsonResumeProfile = {
  network?: string;
  username?: string;
  url?: string;
};

type JsonResumeBasics = {
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: {
    city?: string;
    region?: string;
    countryCode?: string;
  };
  profiles?: JsonResumeProfile[];
};

type JsonResumeWork = {
  name?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  location?: string;
};

type JsonResumeEducation = {
  institution?: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  courses?: string[];
};

type JsonResumeSkill = {
  name?: string;
  keywords?: string[];
};

type JsonResumeProject = {
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
  url?: string;
};

type JsonResumeLanguage = {
  language?: string;
  fluency?: string;
};

export type JsonResume = {
  $schema?: string;
  basics?: JsonResumeBasics;
  work?: JsonResumeWork[];
  education?: JsonResumeEducation[];
  skills?: JsonResumeSkill[];
  projects?: JsonResumeProject[];
  languages?: JsonResumeLanguage[];
};

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

const COUNTRY_CODES: Record<string, string> = {
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

const isHttpUrl = (value: string | undefined): value is string =>
  isNonEmptyString(value) && /^https?:\/\//i.test(value);

export function normalizeDate(input: string | undefined): string | undefined {
  if (!isNonEmptyString(input)) {
    return undefined;
  }

  const value = input.trim();
  if (/^(present|current|ongoing)$/i.test(value)) {
    return undefined;
  }

  const fullIso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (fullIso) {
    return `${fullIso[1]}-${fullIso[2]}-${fullIso[3]}`;
  }

  const yearMonth = value.match(/^(\d{4})-(\d{2})$/);
  if (yearMonth) {
    return `${yearMonth[1]}-${yearMonth[2]}-01`;
  }

  const yearOnly = value.match(/^(\d{4})$/);
  if (yearOnly) {
    return `${yearOnly[1]}-01-01`;
  }

  const monthYear = value.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);
  if (monthYear) {
    const month = MONTH_MAP[monthYear[1].slice(0, 3).toLowerCase()];
    if (month) {
      return `${monthYear[2]}-${month}-01`;
    }
  }

  return undefined;
}

const uniqueStrings = (values: string[]): string[] =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const profileUsernameFromUrl = (url: string): string | undefined => {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1];
  } catch {
    return undefined;
  }
};

const profileNetworkFromUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (hostname.includes("linkedin.com")) return "LinkedIn";
    if (hostname.includes("github.com")) return "GitHub";
    if (hostname.includes("vimeo.com")) return "Vimeo";
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "YouTube";
    if (hostname.includes("imdb.com")) return "IMDb";
    return hostname;
  } catch {
    return "Web";
  }
};

const mapLocation = (location: string | undefined): JsonResumeBasics["location"] | undefined => {
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
  const countryCode = region ? COUNTRY_CODES[region.toLowerCase()] : undefined;

  return {
    city,
    region,
    countryCode,
  };
};

const mapPortfolioDates = (project: PortfolioItem): { startDate?: string; endDate?: string } => {
  if (!isNonEmptyString(project.year)) {
    return {};
  }

  const trimmed = project.year.trim();
  const range = trimmed.match(/^(\d{4})\s*-\s*(\d{4})$/);
  if (range) {
    return {
      startDate: `${range[1]}-01-01`,
      endDate: `${range[2]}-12-31`,
    };
  }

  const normalized = normalizeDate(trimmed);
  if (!normalized) {
    return {};
  }

  const year = normalized.slice(0, 4);
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
};

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined) as unknown as T;
    return cleaned;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, stripUndefinedDeep(entryValue)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

export function mapCvDataToJsonResume(cvData: CVData): JsonResume {
  const contactLinks = cvData.contact.links
    .map((item) => item.url)
    .filter(isHttpUrl);

  const directProfiles: Array<{ network: string; url: string }> = [];
  if (isHttpUrl(cvData.contact.linkedin)) {
    directProfiles.push({ network: "LinkedIn", url: cvData.contact.linkedin });
  }
  if (isHttpUrl(cvData.contact.vimeo)) {
    directProfiles.push({ network: "Vimeo", url: cvData.contact.vimeo });
  }
  if (isHttpUrl(cvData.contact.imdb)) {
    directProfiles.push({ network: "IMDb", url: cvData.contact.imdb });
  }

  const profileMap = new Map<string, JsonResumeProfile>();
  for (const profile of directProfiles) {
    profileMap.set(profile.url, {
      network: profile.network,
      url: profile.url,
      username: profileUsernameFromUrl(profile.url),
    });
  }

  for (const url of contactLinks) {
    if (!profileMap.has(url)) {
      profileMap.set(url, {
        network: profileNetworkFromUrl(url),
        url,
        username: profileUsernameFromUrl(url),
      });
    }
  }

  const summary = uniqueStrings(cvData.about.paragraphs).join("\n\n");
  const basics: JsonResumeBasics = {
    name: cvData.hero.name,
    label: cvData.hero.title,
    image: cvData.hero.photoUrl,
    email: cvData.contact.email,
    phone: cvData.contact.phone,
    url: isHttpUrl(cvData.contact.website)
      ? cvData.contact.website
      : cvData.portfolio.find((project) => isHttpUrl(project.url))?.url,
    summary: isNonEmptyString(summary) ? summary : undefined,
    location: mapLocation(cvData.contact.location),
    profiles: Array.from(profileMap.values()),
  };

  const work: JsonResumeWork[] = cvData.experience.map((item) => ({
    name: item.company,
    position: item.role,
    url: item.links?.map((link) => link.url).find((url) => isHttpUrl(url)),
    startDate: normalizeDate(item.startDate),
    endDate: normalizeDate(item.endDate),
    summary: item.description,
    highlights: uniqueStrings(item.highlights ?? []),
    location: item.location,
  }));

  const education: JsonResumeEducation[] = cvData.education.map((item) => ({
    institution: item.institution,
    area: item.degree,
    studyType: /course/i.test(item.degree) ? "Course" : "Academic",
    startDate: normalizeDate(item.startDate),
    endDate: normalizeDate(item.endDate),
    courses: item.description ? [item.description] : undefined,
  }));

  const skillMap = new Map<string, Set<string>>();
  for (const section of cvData.skills.sections) {
    for (const group of section.groups) {
      const name = isNonEmptyString(group.category) ? group.category : section.title;
      if (!skillMap.has(name)) {
        skillMap.set(name, new Set<string>());
      }
      for (const skill of group.skills) {
        if (isNonEmptyString(skill)) {
          skillMap.get(name)?.add(skill);
        }
      }
    }
  }
  if (cvData.skills.personal.length > 0) {
    if (!skillMap.has("Personal")) {
      skillMap.set("Personal", new Set<string>());
    }
    for (const personalSkill of cvData.skills.personal) {
      if (isNonEmptyString(personalSkill)) {
        skillMap.get("Personal")?.add(personalSkill);
      }
    }
  }

  const skills: JsonResumeSkill[] = Array.from(skillMap.entries()).map(([name, keywords]) => ({
    name,
    keywords: Array.from(keywords),
  }));

  const projects: JsonResumeProject[] = [...cvData.portfolio]
    .sort((a, b) => a.order - b.order)
    .map((project) => {
      const dates = mapPortfolioDates(project);
      return {
        name: project.title,
        startDate: dates.startDate,
        endDate: dates.endDate,
        description: project.descriptor,
        highlights: uniqueStrings((project.games ?? []).map((game) => game.name)),
        url: project.url,
      };
    });

  const languages: JsonResumeLanguage[] = cvData.languages.map((language) => ({
    language: language.language,
    fluency: language.proficiency,
  }));

  const resume = stripUndefinedDeep<JsonResume>({
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json",
    basics,
    work: work.length > 0 ? work : undefined,
    education: education.length > 0 ? education : undefined,
    skills: skills.length > 0 ? skills : undefined,
    projects: projects.length > 0 ? projects : undefined,
    languages: languages.length > 0 ? languages : undefined,
  });

  return resume;
}
