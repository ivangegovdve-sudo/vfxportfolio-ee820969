import { expect, Page, test } from "@playwright/test";

const MOBILE_WIDTHS = [320, 375, 430] as const;

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

const attachProbe = (page: Page) => {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
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

    if (msg.type() === "warning") {
      consoleWarnings.push(msg.text());
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

  return {
    consoleErrors,
    consoleWarnings,
    pageErrors,
    requestFailures,
    response404s,
    imageRequests,
    imageResponses,
    imageRequestFailures,
  };
};

const assertCleanConsoleAndNetwork = (probe: ReturnType<typeof attachProbe>) => {
  expect(probe.consoleErrors).toEqual([]);
  expect(probe.consoleWarnings).toEqual([]);
  expect(probe.pageErrors).toEqual([]);
  expect(probe.requestFailures).toEqual([]);
  expect(probe.response404s).toEqual([]);
};

type ThumbnailRow = {
  entry: string;
  srcType: "import" | "public";
  previewURL: string;
  httpStatus: number;
  requested: "Y" | "N";
  naturalWidth: number;
};

const collectPreviewThumbnailRows = async (
  page: Page,
  probe: ReturnType<typeof attachProbe>
): Promise<ThumbnailRow[]> => {
  await page.locator("#portfolio").scrollIntoViewIfNeeded();
  const portfolioImages = page.locator("#portfolio img");
  await expect(portfolioImages.first()).toBeVisible();

  const imageCount = await portfolioImages.count();
  expect(imageCount).toBeGreaterThanOrEqual(7);

  const rows: ThumbnailRow[] = [];
  const seenUrls = new Set<string>();

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

    const [entry, source, naturalWidth] = await image.evaluate((element) => {
      const img = element as HTMLImageElement;
      return [img.alt, img.currentSrc || img.src, img.naturalWidth] as const;
    });

    const previewURL = normalizeUrl(source);
    if (previewURL.startsWith("data:") || seenUrls.has(previewURL)) {
      continue;
    }
    seenUrls.add(previewURL);

    const requestFailure = probe.imageRequestFailures.get(previewURL);
    expect(
      requestFailure,
      `Image request failed for ${previewURL}: ${requestFailure ?? "unknown"}`
    ).toBeUndefined();

    const status = probe.imageResponses.get(previewURL);
    expect(status, `Image response status missing for ${previewURL}`).toBeDefined();
    expect(status, `Image returned HTTP ${status} for ${previewURL}`).toBeGreaterThanOrEqual(200);
    expect(status, `Image returned HTTP ${status} for ${previewURL}`).toBeLessThan(400);

    rows.push({
      entry,
      srcType: previewURL.includes("/assets/") ? "public" : "import",
      previewURL,
      httpStatus: status as number,
      requested: probe.imageRequests.has(previewURL) ? "Y" : "N",
      naturalWidth,
    });
  }

  return rows;
};

test("stage-a smoke matrices", async ({ page, request }) => {
  const probe = attachProbe(page);
  const navRows: string[] = [];
  const redTigerRows: string[] = [];
  let previewThumbnailRows: ThumbnailRow[] = [];

  for (const width of MOBILE_WIDTHS) {
    await page.setViewportSize({ width, height: 860 });
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

    const topNavMetrics = await page.evaluate(getNavMetrics);
    expect(topNavMetrics.minWidth).toBeGreaterThanOrEqual(44);
    expect(topNavMetrics.minHeight).toBeGreaterThanOrEqual(44);
    expect(topNavMetrics.hasOverlap).toBeFalsy();
    expect(topNavMetrics.outOfBounds).toBeFalsy();

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.2, behavior: "instant" }));
    await expect(page.locator("nav a[aria-label='Home']")).toBeVisible();
    await expect(page.locator("nav a[href^='#']")).toHaveCount(6);
    await page.waitForTimeout(450);

    const navMetrics = await page.evaluate(getNavMetrics);
    const overlap = navMetrics.hasOverlap ? "Y" : "N";
    const boundsOK = navMetrics.outOfBounds ? "N" : "Y";
    const touchTargets = navMetrics.minWidth >= 44 && navMetrics.minHeight >= 44 ? "Y" : "N";
    const consoleClean =
      probe.consoleErrors.length === 0 &&
      probe.consoleWarnings.length === 0 &&
      probe.pageErrors.length === 0
        ? "Y"
        : "N";

    navRows.push(`${width} | ${overlap} | ${boundsOK} | ${touchTargets} | ${consoleClean}`);

    await page.locator("#portfolio").scrollIntoViewIfNeeded();
    const toggleButton = page.locator("#portfolio button[aria-controls$='games-list']").first();
    await expect(toggleButton).toBeVisible();

    const buttonSemantics = (await toggleButton.evaluate((element) => {
      const node = element;
      return (
        node.tagName.toLowerCase() === "button" &&
        node.hasAttribute("aria-controls") &&
        node.hasAttribute("aria-expanded")
      );
    }))
      ? "Y"
      : "N";

    const gamesGrid = page.locator("#portfolio [id$='games-list']").first();
    const collapsedCount = await gamesGrid.locator(":scope > *").count();
    const heights = [await gamesGrid.evaluate((node) => Math.round(node.getBoundingClientRect().height))];

    await toggleButton.click();
    await expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    for (const delay of [60, 130, 240]) {
      await page.waitForTimeout(delay);
      heights.push(await gamesGrid.evaluate((node) => Math.round(node.getBoundingClientRect().height)));
    }

    const expandedCount = await gamesGrid.locator(":scope > *").count();
    const toggleWorks = expandedCount > collapsedCount ? "Y" : "N";
    const noOverflow = (await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
      ? "Y"
      : "N";

    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 420);
    await page.waitForTimeout(120);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    const scrollOK = scrollAfter > scrollBefore ? "Y" : "N";
    const noSnap = new Set(heights).size > 1 ? "Y" : "N";

    await toggleButton.click();
    await expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    expect(buttonSemantics).toBe("Y");
    expect(toggleWorks).toBe("Y");
    expect(noOverflow).toBe("Y");
    expect(scrollOK).toBe("Y");
    expect(noSnap).toBe("Y");

    redTigerRows.push(`${width} | ${buttonSemantics} | ${toggleWorks} | ${noOverflow} | ${scrollOK} | ${noSnap}`);

    if (width === 320) {
      previewThumbnailRows = await collectPreviewThumbnailRows(page, probe);
    }
  }

  console.log("THUMBNAIL MATRIX (PREVIEW)");
  console.log("entry | srcType(import/public) | previewURL | httpStatus | requested(Y/N) | naturalWidth | devPreviewDelta");
  for (const row of previewThumbnailRows) {
    console.log(
      `${row.entry} | ${row.srcType} | ${row.previewURL} | ${row.httpStatus} | ${row.requested} | ${row.naturalWidth} | n/a`
    );
  }

  console.log("MOBILE NAV MATRIX (320/375/430)");
  console.log("width | overlap(Y/N) | boundsOK(Y/N) | touchTargets>=44(Y/N) | consoleClean(Y/N)");
  for (const row of navRows) {
    console.log(row);
  }

  console.log("RED TIGER MATRIX (320/375/430)");
  console.log("width | buttonSemantics(Y/N) | toggleWorks(Y/N) | noOverflow(Y/N) | scrollOK(Y/N) | noSnap(Y/N)");
  for (const row of redTigerRows) {
    console.log(row);
  }

  assertCleanConsoleAndNetwork(probe);
});
