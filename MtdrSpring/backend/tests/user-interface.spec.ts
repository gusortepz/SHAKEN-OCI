  import { test, expect } from '@playwright/test';

  test.use({
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 }
    }
  });

  test.describe('User Interface Tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173/login');
      await page.evaluate(() => localStorage.clear());
      expect(await page.screenshot()).toMatchSnapshot('screenshotLogin.png');
      await page.getByRole('textbox', { name: 'Username' }).click();
      await page.getByRole('textbox', { name: 'Username' }).fill('gus');
      await page.getByRole('textbox', { name: 'Password' }).click();
      await page.getByRole('textbox', { name: 'Password' }).fill('prueba');
      await page.getByRole('button', { name: 'Sign In' }).click();
    });
    
    test('Creating a task', async ({ page }, testInfo) => {
      testInfo.annotations.push(
        { type: 'testId', description: 'UI-002' },
        { type: 'description', description: 'Crea una nueva tarea desde la UI y valida que la tarea se agregue correctamente a la lista.' }
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
      await expect(page.getByRole('option', { name: 'Sprint 1 (COMPLETED)' })).toBeVisible({ timeout: 10000 });
      await page.getByRole('option', { name: 'Sprint 1 (COMPLETED)' }).click();
      await page.getByRole('spinbutton', { name: 'Story Points' }).click();
      await page.getByRole('spinbutton', { name: 'Story Points' }).fill('5');
      await page.getByRole('spinbutton', { name: 'Estimated Time (hours)' }).click();
      await page.getByRole('spinbutton', { name: 'Estimated Time (hours)' }).fill('3');
      await page.getByRole('button', { name: 'Add Task' }).click();
    });

    test('Navigating through the application', async ({ page }, testInfo) => {
      testInfo.annotations.push(
        { type: 'testId', description: 'UI-003' },
        { type: 'description', description: 'Navega entre las diferentes vistas (KPI, Tasks, Sprints) y valida el correcto funcionamiento de los tabs y filtros.' }
      );
      await page.getByRole('link', { name: 'KPI' }).click();
      await page.getByRole('combobox').click();
      await expect(page.getByRole('option', { name: 'Sprint 2' })).toBeVisible({ timeout: 10000 });
      await page.getByRole('option', { name: 'Sprint 2' }).click();
      await page.getByRole('combobox').click();
      await expect(page.getByRole('option', { name: 'All Sprints' })).toBeVisible({ timeout: 10000 });
      await page.getByRole('option', { name: 'All Sprints' }).click();
      await page.getByRole('link', { name: 'Tasks' }).click();
      await expect(page.getByRole('tab', { name: 'Sprint 1' })).toBeVisible({ timeout: 100000 });
      await page.getByRole('tab', { name: 'Sprint 1' }).click();
      await expect(page.getByRole('tab', { name: 'Sprint 2' })).toBeVisible({ timeout: 100000 });
      await page.getByRole('tab', { name: 'Sprint 2' }).click();
      await expect(page.getByRole('button', { name: 'Reset all filters' })).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: 'Reset all filters' }).click();
    });
  });
