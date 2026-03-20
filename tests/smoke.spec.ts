import { expect, Page, test } from "@playwright/test";

const MOBILE_WIDTHS = [320, 375, 430] as const;
const POSTER_COUNT = 10;

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

const getRedTigerRailMetrics = () => {
  const wrapper = document.querySelector("[data-red-tiger-sticky-wrapper]") as HTMLElement | null;
  const viewport = document.querySelector("[data-red-tiger-viewport]") as HTMLElement | null;
  const track = document.querySelector("[data-red-tiger-track]") as HTMLElement | null;
  const posters = Array.from(document.querySelectorAll("[data-red-tiger-poster]")) as HTMLElement[];

  if (!wrapper || !viewport || !track || posters.length === 0) {
    return {
      focusWithinBounds: false,
      posterCount: 0,
      scrollWidth: document.documentElement.scrollWidth,
      canScrollHorizontally: false,
      horizontalOffset: 0,
      viewportHeight: 0,
      wrapperHeight: 0,
    };
  }

  const firstPosterRect = posters[0].getBoundingClientRect();

  return {
    focusWithinBounds: firstPosterRect.left >= -1 && firstPosterRect.right <= window.innerWidth + 1,
    posterCount: posters.length,
    scrollWidth: document.documentElement.scrollWidth,
    canScrollHorizontally: track.scrollWidth > track.clientWidth,
    horizontalOffset: track.scrollLeft,
    viewportHeight: Math.round(viewport.getBoundingClientRect().height),
    wrapperHeight: Math.round(wrapper.getBoundingClientRect().height),
  };
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
    const railWrapper = page.locator("[data-red-tiger-sticky-wrapper]");
    await expect(railWrapper).toBeVisible();
    const railTrack = page.locator("[data-red-tiger-track]");
    await expect(railTrack).toBeVisible();
    await expect(page.locator("[data-red-tiger-poster]")).toHaveCount(POSTER_COUNT);
    await page.locator("[data-red-tiger-poster]").first().focus();
    await railTrack.hover();

    await page.evaluate(() => {
      const wrapper = document.querySelector("[data-red-tiger-sticky-wrapper]") as HTMLElement | null;
      if (!wrapper) {
        return;
      }

      const nextTop = wrapper.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(nextTop, 0), behavior: "instant" });
    });
    await page.waitForTimeout(220);

    const railStart = await page.evaluate(getRedTigerRailMetrics);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(180);
    const railMid = await page.evaluate(getRedTigerRailMetrics);
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(180);
    const railEnd = await page.evaluate(getRedTigerRailMetrics);
    const scrollAfter = await page.evaluate(() => window.scrollY);

    const canScrollHorizontally = railStart.canScrollHorizontally ? "Y" : "N";
    const directionOK = railMid.horizontalOffset > railStart.horizontalOffset + 2 ? "Y" : "N";
    const monotonic = railEnd.horizontalOffset >= railMid.horizontalOffset + 2 ? "Y" : "N";
    const noOverflow = railEnd.scrollWidth <= width + 1 ? "Y" : "N";
    const scrollLocked = Math.abs(scrollAfter - scrollBefore) <= 2 ? "Y" : "N";
    const focusSafe = railStart.focusWithinBounds ? "Y" : "N";

    expect(railStart.posterCount).toBe(POSTER_COUNT);
    expect(canScrollHorizontally).toBe("Y");
    expect(directionOK).toBe("Y");
    expect(monotonic).toBe("Y");
    expect(noOverflow).toBe("Y");
    expect(scrollLocked).toBe("Y");
    expect(focusSafe).toBe("Y");

    redTigerRows.push(
      `${width} | ${canScrollHorizontally} | ${directionOK} | ${monotonic} | ${noOverflow} | ${scrollLocked} | ${focusSafe}`
    );

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
  console.log("width | canScrollHorizontally(Y/N) | directionOK(Y/N) | monotonic(Y/N) | noOverflow(Y/N) | scrollLocked(Y/N) | focusSafe(Y/N)");
  for (const row of redTigerRows) {
    console.log(row);
  }

  assertCleanConsoleAndNetwork(probe);
});
