import { expect, test } from "@playwright/test";

test("app smoke checks on mobile", async ({ page, request }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const requestFailures: string[] = [];
  const response404s: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(String(error));
  });

  page.on("requestfailed", (req) => {
    requestFailures.push(`${req.method()} ${req.url()} :: ${req.failure()?.errorText ?? "failed"}`);
  });

  page.on("response", (res) => {
    if (res.status() === 404) {
      response404s.push(`${res.request().method()} ${res.url()}`);
    }
  });

  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("#hero")).toBeVisible();
  await expect(page.locator("#hero h1")).toBeVisible();

  const heroImageSrc = await page
    .locator("#hero img")
    .first()
    .evaluate((img) => (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src);
  const heroImageResponse = await request.get(heroImageSrc);
  expect(heroImageResponse.status()).toBe(200);

  const mobileNavLinks = page.locator("nav a[href^='#']");
  await expect(mobileNavLinks.first()).toBeVisible();
  await expect(mobileNavLinks).toHaveCount(5);

  const topMinTouch = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("nav a[href^='#']"));
    return links.reduce(
      (acc, el) => {
        const rect = el.getBoundingClientRect();
        return {
          minWidth: Math.min(acc.minWidth, rect.width),
          minHeight: Math.min(acc.minHeight, rect.height),
        };
      },
      { minWidth: Infinity, minHeight: Infinity }
    );
  });

  expect(topMinTouch.minWidth).toBeGreaterThanOrEqual(44);
  expect(topMinTouch.minHeight).toBeGreaterThanOrEqual(44);

  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.2, behavior: "instant" }));
  await expect(page.locator("nav a[aria-label='Home']")).toBeVisible();

  const scrolledMinTouch = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("nav a[href^='#']"));
    return links.reduce(
      (acc, el) => {
        const rect = el.getBoundingClientRect();
        return {
          minWidth: Math.min(acc.minWidth, rect.width),
          minHeight: Math.min(acc.minHeight, rect.height),
        };
      },
      { minWidth: Infinity, minHeight: Infinity }
    );
  });

  expect(scrolledMinTouch.minWidth).toBeGreaterThanOrEqual(44);
  expect(scrolledMinTouch.minHeight).toBeGreaterThanOrEqual(44);

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(requestFailures).toEqual([]);
  expect(response404s).toEqual([]);
});

