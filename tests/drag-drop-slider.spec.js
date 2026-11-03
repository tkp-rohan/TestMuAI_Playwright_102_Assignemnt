const { test, expect } = require('../fixtures/test-fixture');

test('Scenario 2 - Drag the slider with default value 15 to 95', async ({ page }) => {
  await page.goto('https://www.testmuai.com/selenium-playground/');
  await page.getByText('Drag & Drop Sliders', { exact: true }).first().click();
  await expect(page).toHaveURL(/drag-drop-(range-sliders|sliders)/);

  const sliders = page.locator('input[type="range"]');
  const values = await sliders.evaluateAll(elements => elements.map(element => element.value));
  const sliderIndex = values.findIndex(value => Number(value) === 15);
  expect(sliderIndex, `Expected to find a slider initially set to 15. Found: ${values.join(', ')}`).toBeGreaterThanOrEqual(0);

  const slider = sliders.nth(sliderIndex);
  await slider.focus();
  await slider.press('End');
  for (let i = 0; i < 5; i++) await slider.press('ArrowLeft');

  await expect.poll(async () => Number(await slider.inputValue())).toBe(95);
  await expect(page.locator('#rangeSuccess')).toContainText('95');
});
