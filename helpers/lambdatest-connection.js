const crypto = require('node:crypto');
const { chromium } = require('playwright');

const EXPECTED_USERNAME = 'rohanpateldevrp';

function getCredentials() {
  return {
    username: process.env.LT_USERNAME?.trim(),
    accessKey: process.env.LT_ACCESS_KEY?.trim()
  };
}

function fingerprint(value) {
  if (!value) return '(missing)';
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 12);
}

function getCapabilities(testName = 'Playwright 102 auth smoke test') {
  const { username, accessKey } = getCredentials();
  if (!username || !accessKey) {
    throw new Error(
      'Cloud execution requires non-empty LT_USERNAME and LT_ACCESS_KEY. ' +
      'Set both in the HyperExecute project Secrets tab; never commit credentials.'
    );
  }

  const matrixOs = (process.env.HE_ENV_os || process.env.TARGET_OS || 'win').toLowerCase();
  const platform = matrixOs === 'linux' ? 'Linux' : 'Windows 10';
  const browserName = process.env.HE_ENV_browser || process.env.TARGET_BROWSER || 'Chrome';

  return {
    browserName,
    browserVersion: 'latest',
    'LT:Options': {
      platform,
      build: process.env.HE_BUILD_NAME || 'Playwright 102 Assignment',
      name: testName,
      user: username,
      accessKey,
      network: true,
      video: true,
      console: true
    }
  };
}

function logAuthPreflight() {
  const { username, accessKey } = getCredentials();
  console.info('[CDP AUTH PREFLIGHT]', {
    usernamePresent: Boolean(username),
    usernameMatchesExpectedAccount: username === EXPECTED_USERNAME,
    usernameLength: username?.length || 0,
    accessKeyPresent: Boolean(accessKey),
    accessKeyLength: accessKey?.length || 0,
    accessKeyFingerprint: fingerprint(accessKey),
    accessKeyHasOuterQuotes: Boolean(accessKey && /^["'].*["']$/.test(accessKey)),
    testMode: process.env.TEST_MODE || '(unset)',
    matrixOS: process.env.HE_ENV_os || '(unset)',
    matrixBrowser: process.env.HE_ENV_browser || '(unset)'
  });
}

async function connectToLambdaTest(testName) {
  const capabilities = getCapabilities(testName);
  const endpoint = 'wss://cdp.lambdatest.com/playwright?capabilities=' +
    encodeURIComponent(JSON.stringify(capabilities));

  try {
    return await chromium.connect({ wsEndpoint: endpoint, timeout: 30000 });
  } catch (error) {
    // Do not print the WebSocket URL: its capabilities query contains the access key.
    const safeMessage = String(error?.message || error)
      .replace(capabilities['LT:Options'].accessKey, '[REDACTED_ACCESS_KEY]');
    console.error('[CDP CONNECTION FAILED]', {
      errorName: error?.name || 'Error',
      message: safeMessage.split('?capabilities=')[0],
      endpointHost: 'cdp.lambdatest.com',
      endpointPath: '/playwright',
      hint: '401 indicates credential rejection; verify the project-scoped secret values and key rotation.'
    });
    throw new Error(
      'TestMu AI CDP WebSocket connection failed. See the redacted [CDP CONNECTION FAILED] diagnostics above.'
    );
  }
}

module.exports = { connectToLambdaTest, getCapabilities, logAuthPreflight, getCredentials };
