import { test, expect } from '@playwright/test';

const usuarios = [
  { username: 'gus', password: 'prueba' },
  { username: 'dano', password: 'prueba' },
  { username: 'pabi', password: 'prueba' }
];

test.describe.parallel('Login con múltiples usuarios', () => {
  usuarios.forEach(({ username, password }) => {
    test(`Login de usuario: ${username}`, async ({ page }, testInfo) => {
      testInfo.annotations.push(
        { type: 'testId', description: `LOGIN-${username.toUpperCase()}` },
        { type: 'description', description: `Prueba de inicio de sesión y acceso correcto a la aplicación para el usuario ${username}.` }
      );
      await page.goto('http://localhost:5173/login');
      await page.getByRole('textbox', { name: 'Username' }).fill(username);
      await page.getByRole('textbox', { name: 'Password' }).fill(password);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByText('Login successful')).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Add New Task' })).toBeVisible();
    });
  });
});
