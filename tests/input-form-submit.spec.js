const { test, expect } = require('../fixtures/test-fixture');

test('Scenario 3 - Required validation and successful Input Form Submit', async ({ page }) => {
  await page.goto('https://www.testmuai.com/selenium-playground/');
  await page.getByText('Input Form Submit', { exact: true }).first().click();
  await expect(page).toHaveURL(/input-form-demo/);

  const submitButton = page.getByRole('button', { name: 'Submit', exact: true });
  await submitButton.click();

  const nameField = page.locator('input[name="name"]');
  const validation = await nameField.evaluate(element => ({
    invalid: !element.checkValidity(),
    message: element.validationMessage
  }));
  expect(validation.invalid).toBe(true);
  expect(validation.message).toMatch(/Please fill (?:in|out) this field\.?/i);

  await nameField.fill('Rohan Patel');
  await page.locator('#inputEmail4').fill(process.env.FORM_EMAIL || 'qa.assignment@example.com');
  await page.locator('input[name="password"]').fill(process.env.FORM_PASSWORD || 'NotARealPassword123!');
  await page.locator('input[name="company"]').fill('TestMu AI');
  await page.locator('input[name="website"]').fill('https://example.com');

  await page.locator('select[name="country"]').selectOption({ label: 'United States' });

  await page.locator('input[name="city"]').fill('New York');
  await page.locator('input[name="address_line1"]').fill('350 Fifth Avenue');
  await page.locator('#inputAddress2').fill('Floor 10');
  await page.locator('#inputState').fill('New York');
  await page.locator('input[name="zip"]').fill('10118');

  await submitButton.click();
  await expect(page.getByText('Thanks for contacting us, we will get back to you shortly.', { exact: false })).toBeVisible();
});
