import { expect, test } from '@playwright/test';

test('health endpoint responds', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  expect(payload.ok).toBeTruthy();
});

test('local demo wallet can reach an execution plan', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /demo wallet/i }).click();

  await expect(page.getByRole('heading', { name: 'Wallet snapshot' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('radio', { name: /Yield/ }).click();
  await page.getByRole('button', { name: /Continue to execution|Preparing plan/ }).click();

  await expect(page.getByRole('heading', { name: 'Execution plan' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'Tonstakers stake' })).toBeVisible();
});
