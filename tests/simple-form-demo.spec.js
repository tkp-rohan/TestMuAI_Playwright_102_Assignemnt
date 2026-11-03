const { test, expect } = require('../fixtures/test-fixture');

test('Scenario 1 - Simple Form Demo displays the submitted message', async ({ page }) => {
  const message = process.env.TEST_MESSAGE || 'Welcome to TestMu AI';

  await page.goto('https://www.testmuai.com/selenium-playground/');
  await page.getByText('Simple Form Demo', { exact: true }).first().click();

  await expect(page).toHaveURL(/simple-form-demo/);

  const messageInput = page.getByRole('textbox', { name: 'Please enter your Message', exact: true });
  await expect(messageInput).toBeVisible();
  await messageInput.fill(message);

  await page.locator('#showInput').click();
  await expect(page.locator('#message')).toHaveText(message);
});
