import test, { expect } from "@playwright/test";

test.use({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    video: {
        mode: 'on',
        size: { width: 390, height: 844 }
    }
});

test.describe('API Mock Tests', () => {
    test.beforeEach(async ({ page }) => {
    await page.route('**/api/todolist', async (route, request) => {
        const method = request.method();
        const headers = request.headers();
        if (method === 'GET') {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
            {
                id: 1,
                description: 'Mocked Task',
                status: 'TODO',
                creation_ts: new Date().toISOString(),
                priority: 'HIGH',
                createdBy: 1,
                assignee: 1,
                projectId: null,
                sprintId: 1,
                storyPoints: 8,
                estimatedTime: 5,
                realTime: null,
            }
            ]),
        });
        } else if (method === 'POST') {
        const postData = request.postDataJSON();
        route.fulfill({
            status: 201,
            contentType: 'application/json',
            headers: { location: '2' },
            body: JSON.stringify({
            ...postData,
            id: 2,
            creation_ts: new Date().toISOString(),
            }),
        });
        } else {
        route.continue();
        }
    });

    await page.route('**/api/users', route => {
        route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
            {
            id: 1,
            username: 'gus',
            role: 'DEVELOPER',
            avatar: '/avatar.png',
            },
            {
            id: 2,
            username: 'ana',
            role: 'MANAGER',
            }
        ])
        });
    });

    await page.route('**/api/sprint', route => {
        route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
            {
            id: 1,
            name: 'Sprint 1 (COMPLETED)',
            projectId: null,
            startDate: '2024-05-01',
            endDate: '2024-05-10',
            status: 'COMPLETED'
            },
            {
            id: 2,
            name: 'Sprint 2',
            projectId: null,
            startDate: '2024-05-11',
            endDate: '2024-05-20',
            status: 'IN_PROGRESS'
            }
        ])
        });
    });
    await page.goto('http://localhost:5173/login');
    await page.evaluate(() => localStorage.clear());
    await page.getByRole('textbox', { name: 'Username' }).fill('gus');
    await page.getByRole('textbox', { name: 'Password' }).fill('prueba');
    await page.getByRole('button', { name: 'Sign In' }).click();
    });

    test('Creating a task with mocked API', async ({ page }, testInfo) => {
        testInfo.annotations.push(
            { type: 'testId', description: 'UI-001' },
            { type: 'description', description: 'Crea una tarea usando API mockeada manualmente y verifica que la tarea aparece correctamente en la interfaz móvil.' }
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

        await expect(page.getByRole('heading', { name: 'Esto es una prueba' })).toBeVisible({ timeout: 10000 });

        await expect(page.getByText('Your new task has been')).toBeVisible({ timeout: 10000 });
    });
});
