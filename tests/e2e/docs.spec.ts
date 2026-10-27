import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const docsURL = 'http://127.0.0.1:44211';

test('abre a documentação em pt-BR com conteúdo real', async ({ page }) => {
  await page.goto(docsURL);
  await expect(page).toHaveTitle('Documentação | Clinora');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page).toHaveURL(`${docsURL}/constituicao`);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Constituição do Clinora' }),
  ).toBeVisible();
  await expect(page.getByText('Integridade de agenda sob concorrência real.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
});

test('busca um guia e navega diretamente por URL', async ({ page }) => {
  await page.goto(`${docsURL}/arquitetura`);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Arquitetura do Sistema' }),
  ).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar documentos' }).fill('privacidade');
  await page
    .getByRole('navigation', { name: 'Documentos' })
    .getByRole('link', { name: 'Privacidade e segurança' })
    .click();
  await expect(page).toHaveURL(`${docsURL}/privacidade`);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Dados, Privacidade e Segurança' }),
  ).toBeVisible();
});

test('recusa rota fora do catálogo', async ({ page }) => {
  await page.goto(`${docsURL}/arquivo-inexistente`);
  await expect(
    page.getByRole('heading', { name: 'Esta página não está no catálogo.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Voltar à documentação' }).click();
  await expect(page).toHaveURL(`${docsURL}/constituicao`);
});

test('não apresenta violações WCAG A ou AA detectáveis', async ({ page, isMobile }) => {
  await page.goto(`${docsURL}/constituicao`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  if (isMobile) {
    await page.getByRole('button', { name: 'Documentos' }).click();
    await expect(page.getByRole('button', { name: 'Documentos' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  }
  const scan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(scan.violations).toEqual([]);
});
