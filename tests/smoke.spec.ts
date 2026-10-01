import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import type { CVData } from "../src/data/cvData";

// Captured from the provider before the redesign. Thumbnail paths are normalized
// to repository paths: Vite's generated image URLs are intentionally not golden data.
const baseline = JSON.parse(readFileSync(new URL("./fixtures/portfolio-content.json", import.meta.url), "utf8")) as CVData;
const projects = [...baseline.portfolio].sort((a, b) => a.order - b.order).filter((item) => item.type !== "collection");
const collection = baseline.portfolio.find((item) => item.type === "collection")!;
const games = collection.games!;
const trademark = (text: string) => text.split("\\u00AE").join("®");
const probes = new WeakMap<Page, { consoleErrors: string[]; pageErrors: string[]; localFailures: string[] }>();

const isPublishedRead = (url: string) => /\.supabase\.co\/rest\/v1\/cv_published(?:\?|$)/.test(url);

async function openPortfolio(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#hero .hero-role")).toHaveText(baseline.hero.title);
  await expect(page.locator(".experience-entry")).toHaveCount(baseline.experience.length);
  await page.evaluate(() => document.fonts.ready);
}

test.beforeEach(async ({ page }, testInfo) => {
  const probe = { consoleErrors: [] as string[], pageErrors: [] as string[], localFailures: [] as string[] };
  probes.set(page, probe);
  page.on("pageerror", (error) => probe.pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    // Only the deliberately unavailable published-CV read is excluded. Real app
    // exceptions, asset errors and other console errors still fail the suite.
    if (isPublishedRead(message.location().url) && /net::ERR_FAILED/.test(message.text())) return;
    probe.consoleErrors.push(`${message.location().url}: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    if (request.url().startsWith("http://127.0.0.1:4173/")) {
      probe.localFailures.push(`${request.url()}: ${request.failure()?.errorText}`);
    }
  });
  page.on("response", (response) => {
    if (response.url().startsWith("http://127.0.0.1:4173/") && response.status() >= 400) {
      probe.localFailures.push(`${response.status()} ${response.url()}`);
    }
  });
  // The configured Supabase host is unavailable in this environment. Exercise the
  // actual bundled fallback with a failed request; do not simulate API success.
  await page.route("**/rest/v1/cv_published**", (route) => route.abort("failed"));
  testInfo.annotations.push({ type: "content-source", description: "Bundled-content fallback; published Supabase reads are deliberately aborted. This does not verify live API availability." });
  await page.addInitScript(() => {
    localStorage.clear();
    // Headless pointer interactions must never capture the native desktop cursor.
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => undefined;
    Element.prototype.releasePointerCapture = () => undefined;
    Element.prototype.hasPointerCapture = () => false;
    Document.prototype.exitPointerLock = () => undefined;
  });
});

test.afterEach(async ({ page }) => {
  const probe = probes.get(page)!;
  expect(probe.pageErrors, "Unexpected application exception").toEqual([]);
  expect(probe.consoleErrors, "Unexpected console error").toEqual([]);
  expect(probe.localFailures, "Broken production application resource").toEqual([]);
});

test("all original CV wording, metadata, links and language levels remain available", async ({ page }) => {
  await openPortfolio(page);
  const actual = await page.evaluate(() => {
    const text = (root: ParentNode, selector: string) => root.querySelector(selector)?.textContent?.trim() ?? "";
    const texts = (root: ParentNode, selector: string) => Array.from(root.querySelectorAll(selector), (item) => item.textContent?.trim() ?? "");
    const links = (root: ParentNode, selector: string) => Array.from(root.querySelectorAll<HTMLAnchorElement>(selector), (link) => ({ label: link.textContent?.trim() ?? "", url: link.getAttribute("href") }));
    return {
      name: document.querySelector("#hero h1")?.childNodes[0].textContent,
      title: text(document, ".hero-role"),
      subtitle: text(document, ".hero-subtitle"),
      about: texts(document, ".biography-copy > p"),
      experience: Array.from(document.querySelectorAll(".experience-entry"), (entry) => ({
        role: text(entry, ".experience-role"), company: text(entry, ".experience-company"),
        dates: text(entry, ".experience-dates").replace(/\s+/g, " "), location: text(entry, ".experience-location"),
        description: text(entry, ".experience-description"), highlights: texts(entry, ".experience-highlights li"),
        tags: texts(entry, ".experience-tags li"), links: links(entry, ".experience-links a"),
      })),
      projects: Array.from(document.querySelectorAll(".contact-sheet-item"), (entry) => ({
        title: text(entry, ".sheet-project-link"), descriptor: text(entry, ".sheet-project-description"),
        metadata: text(entry, ".sheet-project-meta"), url: entry.querySelector(".sheet-project-link")?.getAttribute("href"),
      })),
      collection: {
        title: text(document, ".collection-heading h3"), descriptor: text(document, ".collection-description"),
        metadata: text(document, ".collection-heading-meta p"), url: document.querySelector(".collection-heading-meta a")?.getAttribute("href"),
      },
      games: Array.from(document.querySelectorAll(".game-ledger-row"), (entry) => ({
        name: text(entry, "a, :scope > span:first-child"), year: text(entry, ".game-ledger-year"),
        url: entry.querySelector("a")?.getAttribute("href"),
      })),
      skills: Array.from(document.querySelectorAll(".skill-section"), (section) => ({
        title: text(section, ".skill-section-title"), groups: Array.from(section.querySelectorAll(".skill-group"), (group) => ({
          category: text(group, ".skill-group-title"), note: text(group, ".skill-group-note"), skills: texts(group, ".skill-list li"),
        })),
      })),
      personal: texts(document, ".personal-skills li"),
      languages: Array.from(document.querySelectorAll(".language-entry"), (entry) => ({
        language: text(entry, ".language-name"), proficiency: text(entry, ".language-proficiency"),
        level: entry.querySelectorAll(".language-level-block--filled").length,
        accessibleLevel: entry.querySelector(".language-level")?.getAttribute("aria-label"),
      })),
      education: Array.from(document.querySelectorAll(".education-entry"), (entry) => ({
        degree: text(entry, ".education-degree"), institution: text(entry, ".education-institution"),
        location: text(entry, ".education-location"), dates: text(entry, ".education-dates").replace(/\s+/g, " "),
        description: text(entry, ".education-description"),
      })),
      email: text(document, ".contact-section__email"), location: text(document, ".contact-section__location"),
      contactLinks: links(document, ".contact-section__destinations a"),
    };
  });
  expect(actual).toEqual({
    name: baseline.hero.name, title: baseline.hero.title, subtitle: baseline.hero.subtitle, about: baseline.about.paragraphs,
    experience: baseline.experience.map((entry) => ({
      role: entry.role, company: entry.company, dates: `${entry.startDate} — ${entry.endDate}`, location: entry.location ?? "",
      description: entry.description, highlights: (entry.highlights ?? []).map(trademark), tags: entry.tags ?? [], links: entry.links ?? [],
    })),
    projects: projects.map((item) => ({ title: trademark(item.title), descriptor: item.descriptor, metadata: [item.year, item.category].filter(Boolean).join(" / "), url: item.url })),
    collection: { title: trademark(collection.title), descriptor: collection.descriptor, metadata: [collection.category, collection.year].filter(Boolean).join(" / "), url: collection.url },
    games: games.map((game) => ({ name: trademark(game.name), year: game.year ?? "", url: game.url ?? null })),
    skills: baseline.skills.sections.map((section) => ({ title: section.title, groups: section.groups.map((group) => ({ category: group.category, note: group.note ?? "", skills: group.skills })) })),
    personal: baseline.skills.personal,
    languages: baseline.languages.map((language) => ({ ...language, accessibleLevel: `${language.language} proficiency level ${language.level} of 5` })),
    education: baseline.education.map((entry) => ({ degree: entry.degree, institution: entry.institution, location: entry.location ?? "", dates: `${entry.startDate} — ${entry.endDate}`, description: entry.description ?? "" })),
    email: baseline.contact.email, location: baseline.contact.location, contactLinks: baseline.contact.links,
  });
  await expect(page.locator(".contact-section__email")).toHaveAttribute("href", `mailto:${baseline.contact.email}`);
  await expect(page.locator(".hero-portrait-plane img")).toHaveAttribute("alt", baseline.hero.name);
  await expect.poll(() => page.locator(".hero-portrait-plane img").evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  await expect(page.locator(".contact-section__introduction p")).toHaveText("Available for freelance compositing, VFX, and animation projects. Feel free to reach out.");
  await expect(page.locator(".collection-note")).toHaveText("Published under the Red Tiger brand");
  await expect(page.locator("footer")).toContainText("Built with care");
  await expect(page.locator("footer")).toContainText("All trademarks and brand names are the property of their respective owners. Project references are presented for portfolio purposes only.");
  await expect(page.getByRole("link", { name: "Admin sign in" })).toHaveAttribute("href", "/admin");
  const unsafeLinks = await page.locator("main a[href^='http']").evaluateAll((links) => links.filter((link) => link.getAttribute("target") !== "_blank" || !link.getAttribute("rel")?.includes("noopener") || !link.getAttribute("rel")?.includes("noreferrer")).map((link) => link.getAttribute("href")));
  expect(unsafeLinks).toEqual([]);
});

for (const width of [320, 375, 430]) {
  test(`${width}px navigation keeps six usable targets and content clear of the fixed header`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 });
    await openPortfolio(page);
    const navigation = page.locator(".portfolio-nav__links a");
    await expect(navigation).toHaveCount(6);
    const metrics = await navigation.evaluateAll((links) => {
      const rectangles = links.map((link) => link.getBoundingClientRect());
      return {
        usable: rectangles.every((rect) => rect.width >= 44 && rect.height >= 44),
        inBounds: rectangles.every((rect) => rect.left >= 0 && rect.right <= innerWidth + 1),
        overlap: rectangles.some((a, index) => rectangles.slice(index + 1).some((b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1)),
      };
    });
    expect(metrics).toEqual({ usable: true, inBounds: true, overlap: false });
    for (const id of ["portfolio", "experience", "skills", "education", "contact", "hero"]) {
      await page.locator(`.portfolio-nav__links a[href='#${id}']`).click();
      await expect(page.locator(`.portfolio-nav__links a[href='#${id}']`)).toHaveAttribute("aria-current", "page");
      await expect.poll(() => page.evaluate((sectionId) => {
        const headerBottom = document.querySelector("nav")!.getBoundingClientRect().bottom;
        const content = document.querySelector(sectionId === "hero" ? "#hero .hero-role" : `#${sectionId}`)!;
        return content.getBoundingClientRect().top >= headerBottom - 1;
      }, id)).toBe(true);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `Page overflow after navigating to ${id}`).toBeLessThanOrEqual(1);
    }
  });
}

test("contact-sheet pointer and keyboard selection synchronize the actual frame and watch links", async ({ page }) => {
  await openPortfolio(page);
  const selectors = page.locator(".contact-sheet-select");
  await expect(selectors).toHaveCount(projects.length);
  for (let index = 0; index < projects.length; index += 1) {
    await selectors.nth(index).click();
    await expect(selectors.nth(index)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#projector-caption h3")).toHaveText(trademark(projects[index].title));
    await expect(page.locator("#projector-caption p")).toHaveText(projects[index].descriptor);
    await expect(page.locator(".projector-screen")).toHaveAttribute("href", projects[index].url);
    await expect(page.locator("#projector-caption a")).toHaveAttribute("href", projects[index].url);
    const source = await selectors.nth(index).locator("img").getAttribute("src");
    await expect(page.locator(".projector-screen img")).toHaveAttribute("src", source!);
    await expect(page.locator(".projector-screen img")).toHaveAttribute("alt", projects[index].title);
    await expect.poll(() => page.locator(".projector-screen img").evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  }
  await selectors.nth(0).focus();
  for (const [key, index] of [["ArrowRight", 1], ["End", projects.length - 1], ["ArrowRight", 0], ["ArrowLeft", projects.length - 1], ["Home", 0]] as const) {
    await page.keyboard.press(key);
    await expect(selectors.nth(index)).toBeFocused();
    await expect(selectors.nth(index)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#projector-caption h3")).toHaveText(trademark(projects[index].title));
    await expect(page.locator(".projector-screen")).toHaveAttribute("href", projects[index].url);
  }
});

test("all 39 released games are shown and each year filters the original names and destinations", async ({ page }) => {
  await openPortfolio(page);
  const rows = page.locator(".game-ledger-row");
  await expect(rows).toHaveCount(39);
  const filter = page.getByRole("combobox", { name: "Filter released games by year" });
  for (const year of [...new Set(games.map((game) => game.year))]) {
    await filter.selectOption(year!);
    const expectedGames = games.filter((game) => game.year === year);
    await expect(rows).toHaveCount(expectedGames.length);
    expect(await rows.locator("a").allTextContents()).toEqual(expectedGames.map((game) => trademark(game.name)));
    expect(await rows.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(expectedGames.map((game) => game.url));
    expect(await rows.locator(".game-ledger-year").allTextContents()).toEqual(expectedGames.map(() => year));
  }
  await filter.selectOption("all");
  await expect(rows).toHaveCount(39);
});

test("native poster rail buttons move artwork, focused posters stay in view and vertical wheels scroll the page", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 860 });
  await openPortfolio(page);
  const track = page.locator("[data-red-tiger-track]");
  const posters = page.locator("[data-red-tiger-poster]");
  await expect(posters).toHaveCount(games.filter((game) => game.posterUrl).length);
  await expect(page.getByRole("button", { name: "Next game posters" })).toHaveAttribute("aria-controls", `${collection.id}-posters`);
  await page.getByRole("button", { name: "Next game posters" }).click();
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(20);
  await posters.last().focus();
  await expect(posters.last()).toBeFocused();
  const focusBounds = await posters.last().evaluate((poster) => {
    const element = poster.getBoundingClientRect();
    const viewport = poster.parentElement!.getBoundingClientRect();
    return { left: element.left >= viewport.left - 1, right: element.right <= viewport.right + 1 };
  });
  expect(focusBounds).toEqual({ left: true, right: true });
  await posters.first().focus();
  await track.scrollIntoViewIfNeeded();
  await track.hover();
  const before = await page.evaluate(() => ({ pageY: scrollY, railX: document.querySelector("[data-red-tiger-track]")!.scrollLeft }));
  await page.mouse.wheel(0, 260);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before.pageY + 100);
  expect(await track.evaluate((element) => element.scrollLeft)).toBeCloseTo(before.railX, 0);
});

test("JSON Resume downloads the unchanged identity, full career, project collection and qualifications", async ({ page }) => {
  await openPortfolio(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download JSON Resume" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("resume.json");
  const file = await download.path();
  expect(file).not.toBeNull();
  const resume = JSON.parse(readFileSync(file!, "utf8"));
  expect(resume.basics).toMatchObject({ name: baseline.hero.name, label: baseline.hero.title, email: baseline.contact.email, summary: baseline.about.paragraphs.join("\n\n") });
  expect(resume.work).toHaveLength(9);
  expect(resume.work.map((entry: { name: string; position: string; summary: string; location: string }) => ({ name: entry.name, position: entry.position, summary: entry.summary, location: entry.location }))).toEqual(baseline.experience.map((entry) => ({ name: entry.company, position: entry.role, summary: entry.description, location: entry.location })));
  expect(resume.projects).toHaveLength(7);
  expect(resume.projects.map((project: { name: string; description: string; url: string }) => ({ name: project.name, description: project.description, url: project.url }))).toEqual([...baseline.portfolio].sort((a, b) => a.order - b.order).map((project) => ({ name: project.title, description: project.descriptor, url: project.url })));
  const exportedGames = resume.projects.find((project: { name: string }) => project.name === collection.title).highlights;
  expect(exportedGames).toHaveLength(39);
  expect(exportedGames).toEqual(games.map((game) => game.name));
  expect(resume.education).toHaveLength(2);
  expect(resume.languages).toEqual(baseline.languages.map((language) => ({ language: language.language, fluency: language.proficiency })));
  expect(resume.skills.flatMap((section: { keywords: string[] }) => section.keywords)).toEqual([...baseline.skills.sections.flatMap((section) => section.groups.flatMap((group) => group.skills)), ...baseline.skills.personal]);
});

test("a collection-only published fixture keeps its portrait and usable editor controls", async ({ page }, testInfo) => {
  const custom = structuredClone(baseline);
  custom.hero.name = "Collection-only regression fixture";
  custom.hero.photoUrl = "/assets/slackPic.webp";
  custom.portfolio = [{ ...collection, thumbnail: "/assets/arcanaMagica.png" }];
  testInfo.annotations.push({ type: "synthetic-published-payload", description: "A routed fixture tests published-data rendering; it makes no claim about the real Supabase service." });
  await page.route("**/rest/v1/cv_published**", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify([{ data: custom, name: "Regression fixture", slug: "test-collection-only" }]),
  }));
  await page.goto("/cv/test-collection-only?edit=true", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#hero h1")).toContainText(custom.hero.name);
  await expect(page.locator(".hero-portrait-only")).toBeVisible();
  await expect(page.locator(".hero-portrait-only")).toHaveAttribute("alt", custom.hero.name);
  await expect.poll(() => page.locator(".hero-portrait-only").evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  await expect(page.locator(".projector-screen")).toHaveCount(0);
  await expect(page.locator(".game-ledger-row")).toHaveCount(39);

  await page.locator("button:has(svg.lucide-pencil)").click();
  await expect(page.getByRole("heading", { name: "Content Editor", exact: true })).toBeVisible();
  const editorTitle = page.locator("input#hero-title");
  await editorTitle.fill("Published fixture animation lead");
  await expect(page.locator(".hero-role")).toHaveText("Published fixture animation lead");
  await page.getByTitle("Collapse editor", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Content Editor", exact: true })).not.toBeVisible();
  await page.getByTitle("Expand editor", { exact: true }).click();
  await expect(editorTitle).toHaveValue("Published fixture animation lead");
});
