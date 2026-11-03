const base = require('@playwright/test');
const { chromium } = require('playwright');

const test = base.test.extend({
  page: async ({}, use, testInfo) => {
    let browser;
    let page;
    const username = process.env.LT_USERNAME;
    const accessKey = process.env.LT_ACCESS_KEY;
    const useCloud = process.env.TEST_MODE === 'cloud';

    if (useCloud) {
      if (!username || !accessKey) {
        throw new Error('Cloud execution requires LT_USERNAME and LT_ACCESS_KEY.');
      }

      const matrixOs = (process.env.HE_ENV_os || process.env.TARGET_OS || 'win').toLowerCase();
      const platform = matrixOs === 'linux' ? 'Linux' : 'Windows 10';
      const browserName = process.env.HE_ENV_browser || process.env.TARGET_BROWSER || 'Chrome';
      const capabilities = {
        browserName,
        browserVersion: 'latest',
        'LT:Options': {
          platform,
          build: process.env.HE_BUILD_NAME || 'Playwright 102 Assignment',
          name: testInfo.title,
          user: username,
          accessKey,
          network: true,
          video: true,
          console: true,
          visual: true,
          commandLog: true,
          playwrightClientVersion: require('@playwright/test/package.json').version
        }
      };

      const endpoint = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`;
      browser = await chromium.connect({ wsEndpoint: endpoint });
      page = await browser.newPage();
    } else {
      browser = await chromium.launch({ headless: true });
      page = await browser.newPage();
    }

    const consoleLines = [];
    const failedRequests = [];
    page.on('console', message => consoleLines.push(`[${message.type()}] ${message.text()}`));
    page.on('pageerror', error => consoleLines.push(`[pageerror] ${error.message}`));
    page.on('requestfailed', request => failedRequests.push(`[${request.method()}] ${request.url()} :: ${request.failure()?.errorText || 'failed'}`));

    await use(page);

    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(process.cwd(), 'artifacts', 'logs');
    fs.mkdirSync(logDir, { recursive: true });
    const safeTitle = testInfo.title.replace(/[^a-z0-9-_]+/gi, '_');
    fs.writeFileSync(path.join(logDir, `${safeTitle}-console.log`), consoleLines.join('\n'));
    fs.writeFileSync(path.join(logDir, `${safeTitle}-network.log`), failedRequests.join('\n'));

    if (testInfo.status !== testInfo.expectedStatus && page && !page.isClosed()) {
      const screenshotPath = testInfo.outputPath('failure.png');
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      await testInfo.attach('failure-screenshot', { path: screenshotPath, contentType: 'image/png' }).catch(() => {});
    }

    if (useCloud && page && !page.isClosed()) {
      const status = testInfo.status === testInfo.expectedStatus ? 'passed' : 'failed';
      const remark = testInfo.status === testInfo.expectedStatus ? 'Assertions passed' : `Test ended with status: ${testInfo.status}`;
      await page.evaluate(() => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status, remark } })}`).catch(() => {});
    }

    await browser.close();
  }
});

module.exports = { test, expect: base.expect };
