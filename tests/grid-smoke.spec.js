const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');

test('HyperExecute remote browser connection smoke test', async () => {
  const username = process.env.LT_USERNAME;
  const accessKey = process.env.LT_ACCESS_KEY;
  if (!username || !accessKey) {
    throw new Error('Missing LT_USERNAME or LT_ACCESS_KEY HyperExecute secret.');
  }

  const platform = process.env.HE_DIAGNOSTIC_PLATFORM || 'Windows 10';
  const capabilities = {
    browserName: 'Chrome',
    browserVersion: 'latest',
    'LT:Options': {
      platform,
      build: 'Playwright 102 - CDP Diagnostic',
      name: 'Remote browser connection smoke test',
      user: username,
      accessKey,
      network: true,
      video: true,
      console: true
    }
  };

  const endpoint = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`;
  let browser;
  try {
    browser = await chromium.connect({ wsEndpoint: endpoint, timeout: 60000 });
    const page = await browser.newPage();
    await page.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page).toHaveTitle(/Example Domain/);
    console.log('REMOTE_CDP_SMOKE_TEST_PASSED', JSON.stringify({ platform, title: await page.title() }));
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
});
