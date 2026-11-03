// Run with LT_USERNAME and LT_ACCESS_KEY set in your shell.
// This opens one remote browser session and never prints the credential or WebSocket URL.
const { connectToLambdaTest, logAuthPreflight } = require('../helpers/lambdatest-connection');

(async () => {
  let browser;
  try {
    logAuthPreflight();
    browser = await connectToLambdaTest('CDP authentication smoke test');
    const page = await browser.newPage();
    const response = await page.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const title = await page.title();
    console.log('[CDP SMOKE TEST PASSED]', {
      httpStatus: response?.status() ?? null,
      pageTitle: title,
      browserConnected: true
    });
  } catch (error) {
    console.error('[CDP SMOKE TEST FAILED]', error?.message || String(error));
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
})();
