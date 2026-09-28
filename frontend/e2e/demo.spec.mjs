import { test, expect } from '@playwright/test';

test('demo transfers a Spotify playlist to YouTube', async ({ page }, testInfo) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Spotify', exact: true }).click();
  await page.getByText('Late Night Drive').click();
  await page.getByRole('button', { name: /YouTube Music New private playlist/i }).click();
  await page.screenshot({ path: testInfo.outputPath('workspace.png'), fullPage: true });
  await page.getByRole('button', { name: /Preview matches/i }).click();
  await expect(page.getByText('Review matches')).toBeVisible();
  await expect(page.getByLabel('Match for Pink + White')).toHaveValue('');
  await page.getByRole('button', { name: /Create private playlist/i }).click();
  await expect(page.getByText('Transfer complete')).toBeVisible();
});

test('demo remains usable at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await expect(page.getByText('Connected platforms')).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
});

test('demo reviews a YouTube playlist before creating a Spotify copy', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'YouTube Music', exact: true }).click();
  await page.getByText('Soundtrack to Summer').click();
  await page.getByRole('button', { name: /Spotify New private playlist/i }).click();
  await page.getByRole('button', { name: /Preview matches/i }).click();
  await expect(page.getByText('Review matches')).toBeVisible();
  await page.getByLabel('Match for Pink + White').selectOption('match-1');
  await page.getByRole('button', { name: /Create private playlist/i }).click();
  await expect(page.getByText('Transfer complete')).toBeVisible();
});

test('connection return explains a cancelled authorization', async ({ page }) => {
  await page.goto('/demo?connection=denied');
  await expect(page.getByRole('status')).toHaveText('Connection was cancelled.');
});
