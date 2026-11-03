const { test, expect } = require('../fixtures/test-fixture');

test('Scenario 2 - Drag the slider with default value 15 to 95 using the mouse', async ({ page }) => {
  await page.goto('https://www.testmuai.com/selenium-playground/');
  await page.getByText('Drag & Drop Sliders', { exact: true }).first().click();
  await expect(page).toHaveURL(/drag-drop-(range-sliders|sliders)/);

  const sliders = page.locator('input[type="range"]');
  const values = await sliders.evaluateAll(elements => elements.map(element => Number(element.value)));
  const sliderIndex = values.findIndex(value => value === 15);
  expect(sliderIndex, `Expected to find a slider initially set to 15. Found: ${values.join(', ')}`).toBeGreaterThanOrEqual(0);

  const slider = sliders.nth(sliderIndex);
  await expect(slider).toBeVisible();
  await slider.scrollIntoViewIfNeeded();

  const geometry = await slider.evaluate(element => ({
    min: Number(element.min || 0),
    max: Number(element.max || 100),
    value: Number(element.value)
  }));
  const box = await slider.boundingBox();
  expect(box).not.toBeNull();

  const percent = value => (value - geometry.min) / (geometry.max - geometry.min);
  const thumbInset = Math.max(6, box.width * 0.025);
  const startX = box.x + thumbInset + (box.width - thumbInset * 2) * percent(geometry.value);
  const targetX = box.x + thumbInset + (box.width - thumbInset * 2) * percent(95);
  const y = box.y + box.height / 2;

  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(targetX, y, { steps: 20 });
  await page.mouse.up();

  await expect(slider).toHaveValue('95');
  await expect(page.locator('#rangeSuccess')).toContainText('95');
});
