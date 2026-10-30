import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const contract = JSON.parse(
  readFileSync(new URL('../contracts/identity-v1.openapi.json', import.meta.url), 'utf8'),
);
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('contrato de identidade exige bearer e não aceita papel fornecido pelo cliente', () => {
  assert.equal(contract.openapi, '3.1.0');
  assert.deepEqual(Object.keys(contract.paths).sort(), [
    '/api/v1/identity/context',
    '/api/v1/identity/contexts',
  ]);
  for (const path of Object.values(contract.paths)) {
    assert.deepEqual(Object.keys(path), ['get']);
    assert.deepEqual(path.get.security, [{ OidcBearer: [] }]);
    assert.equal(path.get.requestBody, undefined);
    assert.equal(path.get.responses['200'].headers['Cache-Control'].schema.const, 'no-store');
    assert.ok(path.get.responses['401']);
    assert.ok(path.get.responses['503']);
  }
  assert.deepEqual(contract.paths['/api/v1/identity/context'].get.parameters, [
    { $ref: '#/components/parameters/TenantSelection' },
  ]);
  assert.equal(contract.components.parameters.TenantSelection.name, 'X-Clinora-Tenant');
  assert.equal(contract.components.parameters.TenantSelection.required, true);
  assert.equal(contract.components.parameters.TenantSelection.schema.format, 'uuid');
});

test('contexto responde apenas dados necessários e nega seleção não autorizada', () => {
  const schema = contract.components.schemas.TenantContext;
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required, ['tenantId', 'tenantName', 'role', 'unitIds']);
  assert.deepEqual(Object.keys(schema.properties).sort(), [...schema.required].sort());
  assert.deepEqual(schema.properties.role.enum, [
    'OWNER',
    'ADMIN',
    'RECEPTION',
    'PROFESSIONAL',
    'PATIENT',
  ]);
  assert.ok(contract.paths['/api/v1/identity/context'].get.responses['403']);
  assert.match(contract.components.responses.Forbidden.description, /mesma resposta/);
  assert.doesNotMatch(JSON.stringify(schema), /token|password|secret|clinical/i);
});

test('ADR documenta revogação imediata, MFA e confiança exclusiva no servidor', () => {
  const adr = read('docs/adr/0001-oidc-tenant-context.md');
  assert.match(adr, /^Status: Accepted$/m);
  assert.match(adr, /PKCE S256/);
  assert.match(adr, /\(iss, sub\)/);
  assert.match(adr, /revogação ou alteração de/);
  assert.match(adr, /`acr`.*`auth_time`/);
  assert.match(adr, /X-Clinora-Tenant/);
});
