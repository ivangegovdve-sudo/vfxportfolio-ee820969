const { chromium } = require('playwright');

(async () => {
  const expectedOrder = [
    'National Geographic — Brain Freeze',
    'Rescue Heroes',
    'Miro — Souvenir',
    'Showreel',
    'Arcana Magica',
    'In Author’s Hands',
    'Red Tiger collection',
  ];

  const runAudit = async (name, viewport) => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);

    const portfolioTitles = await page.$$eval('#portfolio h3', els =>
      els.map(e => e.textContent.trim())
    );

    const navLabels = await page.$$eval('nav a[href^="#"]', els =>
      els.map(e => e.textContent.trim())
    );

    const hasHamburger = await page.locator('button[aria-label="Toggle navigation"]').count();

    const heroInfo = await page.$eval('section.hero-gradient h1', el => {
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement.getBoundingClientRect();
      return {
        text: el.textContent.trim(),
        fontFamily: cs.fontFamily,
        lineHeight: cs.lineHeight,
        overflowYParent: window.getComputedStyle(el.parentElement).overflowY,
        bottomInsideParent: rect.bottom <= parent.bottom + 1,
      };
    });

    const exactOrderPass = JSON.stringify(portfolioTitles) === JSON.stringify(expectedOrder);

    console.log(JSON.stringify({
      viewport: name,
      navLabels,
      hasHamburger,
      portfolioTitles,
      exactOrderPass,
      heroInfo,
    }));

    await page.screenshot({ path: `artifacts/qa-${name}.png`, fullPage: true });
    await browser.close();
  };

  await runAudit('desktop-1280', { width: 1280, height: 720 });
  await runAudit('mobile-390', { width: 390, height: 844 });
})();
