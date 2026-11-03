import { expect, test } from '@playwright/test';

const issuer = 'http://127.0.0.1:44282/realms/clinora';
const app = 'http://127.0.0.1:44210';
const api = 'http://127.0.0.1:44220';
const tenant = 'f14e1824-8a39-43d1-b7f4-43f4ff4a8252';
const context = { tenantId: tenant, tenantName: 'Clinica Central', role: 'ADMIN', unitIds: [] };

test('acesso direto mostra entrada sem dados de outra pessoa', async ({ page }) => {
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Entre na Clinora' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar com sua conta' })).toBeVisible();
  await expect(page.getByText('Clinica Central')).toHaveCount(0);
});

test('login, contexto negado, step-up e logout', async ({ page }) => {
  let acr = '1';
  await page.route(`${issuer}/.well-known/openid-configuration`, async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': app },
      contentType: 'application/json',
      body: JSON.stringify({
        issuer,
        authorization_endpoint: `${issuer}/protocol/openid-connect/auth`,
        token_endpoint: `${issuer}/protocol/openid-connect/token`,
        revocation_endpoint: `${issuer}/protocol/openid-connect/revoke`,
        end_session_endpoint: `${issuer}/protocol/openid-connect/logout`,
        jwks_uri: `${issuer}/protocol/openid-connect/certs`,
        response_types_supported: ['code'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
      }),
    });
  });

  let nonce = '';
  await page.route(`${issuer}/protocol/openid-connect/auth?**`, async (route) => {
    const request = new URL(route.request().url());
    nonce = request.searchParams.get('nonce') ?? '';
    acr = request.searchParams.get('acr_values') === '2' ? '2' : '1';
    const state = request.searchParams.get('state');
    expect(state).toBeTruthy();
    expect(request.searchParams.get('code_challenge_method')).toBe('S256');
    await route.fulfill({ status: 302, headers: {
      location: `${app}/auth/callback?code=teste&state=${state}`,
    }, body: '' });
  });

  await page.route(`${issuer}/protocol/openid-connect/token`, async (route) => {
    const now = Math.floor(Date.now() / 1000);
    const payload = { iss: issuer, sub: 'pessoa-teste', aud: 'clinora-web',
      exp: now + 300, iat: now, nonce, acr };
    const idToken = `${base64url({ alg: 'RS256', typ: 'JWT' })}.${base64url(payload)}.assinatura`;
    await route.fulfill({ status: 200, contentType: 'application/json',
      headers: { 'access-control-allow-origin': app },
      body: JSON.stringify({ access_token: `acesso-${acr}`, id_token: idToken,
        token_type: 'Bearer', expires_in: 300, scope: 'openid profile clinora' }) });
  });

  await page.route(`${issuer}/protocol/openid-connect/revoke`, async (route) => {
    await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': app } });
  });

  await page.route(`${api}/api/v1/identity/contexts`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json',
      headers: { 'access-control-allow-origin': app }, body: JSON.stringify([context]) });
  });
  await page.route(`${api}/api/v1/identity/context`, async (route) => {
    expect(route.request().headers()['x-clinora-tenant']).toBe(tenant);
    const mfa = route.request().headers()['authorization'] === 'Bearer acesso-2';
    await route.fulfill({ status: mfa ? 200 : 403, contentType: 'application/json',
      headers: { 'access-control-allow-origin': app },
      body: JSON.stringify(mfa ? context : { status: 403 }) });
  });

  await page.route(`${issuer}/protocol/openid-connect/logout?**`, async (route) => {
    const state = new URL(route.request().url()).searchParams.get('state');
    await route.fulfill({ status: 302, headers: {
      location: `${app}/auth/logout?state=${state}`,
    }, body: '' });
  });

  await page.goto('/app');
  await page.getByRole('button', { name: 'Entrar com sua conta' }).click();
  await expect(page.getByRole('heading', { name: 'Selecione uma clínica' })).toBeVisible();
  await page.getByRole('button', { name: 'Selecionar' }).click();
  await expect(page.getByRole('alert')).toContainText('Acesso negado');
  await page.getByRole('button', { name: 'Confirmar verificação adicional' }).click();
  await expect(page.getByRole('heading', { name: 'Selecione uma clínica' })).toBeVisible();
  await page.getByRole('button', { name: 'Selecionar' }).click();
  await expect(page.getByRole('heading', { name: 'Clinica Central' })).toBeVisible();
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page.getByRole('heading', { name: 'Entre na Clinora' })).toBeVisible();
});

function base64url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}
