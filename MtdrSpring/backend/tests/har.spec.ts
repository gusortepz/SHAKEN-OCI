import test, { expect } from "@playwright/test";

test.use({
  video: {
    mode: 'on',
    size: { width: 1280, height: 720 }
  }
});

test.describe('API Mock Tests with HAR', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/har-files/api-mocks.har', {
      url: '**/api/**',
      update: false
    });

    await page.goto('http://localhost:5173/login');
    await page.evaluate(() => localStorage.clear());
    await page.getByRole('textbox', { name: 'Username' }).fill('gus');
    await page.getByRole('textbox', { name: 'Password' }).fill('prueba');
    await page.getByRole('button', { name: 'Sign In' }).click();
  });

  test('Creating a task with mocked API from HAR', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'testId', description: 'API-001' },
      { type: 'description', description: 'Crea una tarea nueva usando respuestas mockeadas desde un archivo HAR y verifica que aparece correctamente.' }
    );
    await expect(page.getByRole('button', { name: 'Add New Task' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Add New Task' }).click();
    await expect(page.getByRole('textbox', { name: 'Description *' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Description *' }).fill('Esto es una prueba');
    await expect(page.getByRole('combobox', { name: 'Assignee' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('combobox', { name: 'Assignee' }).click();
    await expect(page.getByRole('option', { name: 'gus (DEVELOPER)' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('option', { name: 'gus (DEVELOPER)' }).click();
    await expect(page.getByRole('combobox', { name: 'Sprint' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('combobox', { name: 'Sprint' }).click();
    await expect(page.getByRole('option', { name: 'Sprint PRUEBA (COMPLETED)' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('option', { name: 'Sprint PRUEBA (COMPLETED)' }).click();
    await page.getByRole('spinbutton', { name: 'Story Points' }).click();
    await page.getByRole('spinbutton', { name: 'Story Points' }).fill('5');
    await page.getByRole('spinbutton', { name: 'Estimated Time (hours)' }).click();
    await page.getByRole('spinbutton', { name: 'Estimated Time (hours)' }).fill('3');
    await page.getByRole('button', { name: 'Add Task' }).click();
  });
});
