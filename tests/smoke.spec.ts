import { expect, test } from "@playwright/test";

const normalizeUrl = (rawUrl: string): string => {
  try {
    const parsed = new URL(rawUrl);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return rawUrl;
  }
};

const getNavMetrics = () => {
  const links = Array.from(document.querySelectorAll("nav a[href^='#']"));
  const rects = links.map((link) => link.getBoundingClientRect());

  if (rects.length === 0) {
    return { minWidth: 0, minHeight: 0, hasOverlap: false, outOfBounds: false };
  }

  let minWidth = Infinity;
  let minHeight = Infinity;
  let hasOverlap = false;
  let outOfBounds = false;

  for (let i = 0; i < rects.length; i += 1) {
    const current = rects[i];
    minWidth = Math.min(minWidth, current.width);
    minHeight = Math.min(minHeight, current.height);

    if (current.left < -0.5 || current.right > window.innerWidth + 0.5) {
      outOfBounds = true;
    }

    for (let j = i + 1; j < rects.length; j += 1) {
      const next = rects[j];
      const overlapX = Math.max(0, Math.min(current.right, next.right) - Math.max(current.left, next.left));
      const overlapY = Math.max(0, Math.min(current.bottom, next.bottom) - Math.max(current.top, next.top));

      if (overlapX > 2 && overlapY > 2) {
        hasOverlap = true;
      }
    }
  }

  return { minWidth, minHeight, hasOverlap, outOfBounds };
};

test("app smoke checks on mobile", async ({ page, request }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const requestFailures: string[] = [];
  const response404s: string[] = [];
  const imageRequests = new Set<string>();
  const imageResponses = new Map<string, number>();
  const imageRequestFailures = new Map<string, string>();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(String(error));
  });

  page.on("request", (req) => {
    if (req.resourceType() === "image") {
      imageRequests.add(normalizeUrl(req.url()));
    }
  });

  page.on("requestfailed", (req) => {
    requestFailures.push(`${req.method()} ${req.url()} :: ${req.failure()?.errorText ?? "failed"}`);

    if (req.resourceType() === "image") {
      imageRequestFailures.set(
        normalizeUrl(req.url()),
        req.failure()?.errorText ?? "request failed"
      );
    }
  });

  page.on("response", (res) => {
    if (res.request().resourceType() === "image") {
      imageResponses.set(normalizeUrl(res.url()), res.status());
    }

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

  const topNavMetrics = await page.evaluate(getNavMetrics);

  expect(topNavMetrics.minWidth).toBeGreaterThanOrEqual(44);
  expect(topNavMetrics.minHeight).toBeGreaterThanOrEqual(44);
  expect(topNavMetrics.hasOverlap).toBeFalsy();
  expect(topNavMetrics.outOfBounds).toBeFalsy();

  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.2, behavior: "instant" }));
  await expect(page.locator("nav a[aria-label='Home']")).toBeVisible();
  await expect(page.locator("nav a[href^='#']")).toHaveCount(6);
  await page.waitForTimeout(450);

  const scrolledNavMetrics = await page.evaluate(getNavMetrics);

  expect(scrolledNavMetrics.minWidth).toBeGreaterThanOrEqual(44);
  expect(scrolledNavMetrics.minHeight).toBeGreaterThanOrEqual(44);
  expect(scrolledNavMetrics.hasOverlap).toBeFalsy();
  expect(scrolledNavMetrics.outOfBounds).toBeFalsy();

  await page.locator("#portfolio").scrollIntoViewIfNeeded();
  await expect(page.locator("#portfolio")).toBeVisible();

  const portfolioImages = page.locator("#portfolio img");
  await expect(portfolioImages.first()).toBeVisible();

  const imageCount = await portfolioImages.count();
  expect(imageCount).toBeGreaterThanOrEqual(7);

  const checkedImageSources = new Set<string>();

  for (let i = 0; i < imageCount; i += 1) {
    const image = portfolioImages.nth(i);
    await image.scrollIntoViewIfNeeded();

    await expect
      .poll(
        () =>
          image.evaluate((element) => {
            const img = element as HTMLImageElement;
            return img.complete && img.naturalWidth > 0;
          }),
        { timeout: 10_000 }
      )
      .toBe(true);

    const imageSource = normalizeUrl(
      await image.evaluate((element) => {
        const img = element as HTMLImageElement;
        return img.currentSrc || img.src;
      })
    );

    expect(imageSource).not.toBe("");

    if (imageSource.startsWith("data:") || checkedImageSources.has(imageSource)) {
      continue;
    }

    checkedImageSources.add(imageSource);

    const requestFailure = imageRequestFailures.get(imageSource);
    expect(
      requestFailure,
      `Image request failed for ${imageSource}: ${requestFailure ?? "unknown"}`
    ).toBeUndefined();

    const wasRequested = imageRequests.has(imageSource);
    expect(wasRequested, `Image was not requested by the browser: ${imageSource}`).toBeTruthy();

    const status = imageResponses.get(imageSource);
    expect(status, `Image response status missing for ${imageSource}`).toBeDefined();
    expect(status, `Image returned HTTP ${status} for ${imageSource}`).toBeGreaterThanOrEqual(200);
    expect(status, `Image returned HTTP ${status} for ${imageSource}`).toBeLessThan(400);
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(requestFailures).toEqual([]);
  expect(response404s).toEqual([]);
});
