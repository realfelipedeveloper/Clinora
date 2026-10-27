import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('abre a web Clinora em pt-BR sem rolagem horizontal', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Clinora');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { level: 1, name: 'Clinora' })).toBeVisible();
  await page.getByRole('link', { name: 'Clinora, página inicial' }).click();
  await expect(page).toHaveURL('/');
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test('nao apresenta violacoes WCAG A ou AA detectaveis', async ({ page }) => {
  await page.goto('/');
  const scan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(scan.violations).toEqual([]);
});
