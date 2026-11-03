const { test, expect } = require('../fixtures/test-fixture');

test('Scenario 1 - Simple Form Demo displays the submitted message', async ({ page }) => {
  const message = process.env.TEST_MESSAGE || 'Welcome to TestMu AI';

  await page.goto('https://www.testmuai.com/selenium-playground/', { waitUntil: 'domcontentloaded' });
  await page.getByText('Simple Form Demo', { exact: true }).first().click();

  await expect(page).toHaveURL(/simple-form-demo/);

  const messageInput = page.getByRole('textbox', { name: 'Please enter your Message', exact: true });
  const submitButton = page.getByRole('button', { name: 'Get Checked Value', exact: true });
  const output = page.locator('#message');

  await expect(messageInput).toBeVisible();
  await expect(submitButton).toBeVisible();
  await messageInput.fill(message);
  await expect(messageInput).toHaveValue(message);

  await submitButton.click();
  await expect(output).toHaveText(message, { timeout: 20_000 });
});
