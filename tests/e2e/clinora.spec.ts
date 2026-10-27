import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('abre a web Clinora em pt-BR sem rolagem horizontal', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Clinora');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { level: 1, name: 'Clinora' })).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Recepção iluminada de uma clínica contemporânea' }),
  ).toBeVisible();
  expect(
    await page.locator('.hero-image').evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'Clinora, página inicial' }).click();
  await expect(page).toHaveURL('/');
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test('mantem a navegacao utilizavel em telas estreitas', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Clinora' })).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Andamento' }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
});

test('navega da abertura ate as secoes de visao e andamento', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Conhecer a proposta' }).click();
  await expect(page).toHaveURL(/#visao$/);
  await expect(
    page.getByRole('heading', { name: 'Uma rotina mais simples para quem cuida.' }),
  ).toBeInViewport();
  await page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('link', { name: 'Andamento' })
    .click();
  await expect(page).toHaveURL(/#andamento$/);
  await expect(page.getByRole('heading', { name: 'Primeiro, uma base sólida.' })).toBeInViewport();
  await expect(page.getByRole('link', { name: 'Acompanhar o projeto no GitHub' })).toHaveAttribute(
    'rel',
    /noopener noreferrer/,
  );
});

test('nao apresenta violacoes WCAG A ou AA detectaveis', async ({ page }) => {
  await page.goto('/');
  const scan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(scan.violations).toEqual([]);
});
