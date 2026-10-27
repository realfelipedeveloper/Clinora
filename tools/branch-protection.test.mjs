import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verifyBranchProtection } from './branch-protection.mjs';

const protectedBranch = {
  required_status_checks: { strict: true, contexts: ['clinora/qualidade'] },
  required_pull_request_reviews: {
    required_approving_review_count: 0,
    dismiss_stale_reviews: true,
  },
  required_linear_history: { enabled: true },
  required_conversation_resolution: { enabled: true },
  enforce_admins: { enabled: true },
  allow_force_pushes: { enabled: false },
  allow_deletions: { enabled: false },
};

test('aceita politica completa nas tres branches base', () => {
  for (const branch of ['development', 'homologation', 'main']) {
    assert.equal(verifyBranchProtection(branch, protectedBranch), true);
  }
});

test('rejeita branch fora do Git Flow', () => {
  assert.throws(
    () => verifyBranchProtection('feature/teste', protectedBranch),
    /Branch base invalida/,
  );
});

test('rejeita check ausente ou sem atualizacao obrigatoria', () => {
  assert.throws(
    () =>
      verifyBranchProtection('development', { ...protectedBranch, required_status_checks: null }),
    /Status clinora\/qualidade nao obrigatorio/,
  );
  assert.throws(
    () =>
      verifyBranchProtection('development', {
        ...protectedBranch,
        required_status_checks: { strict: false, contexts: ['clinora/qualidade'] },
      }),
    /Status clinora\/qualidade nao obrigatorio/,
  );
});

test('rejeita enfraquecimento de PR, historico ou administradores', () => {
  for (const change of [
    { required_pull_request_reviews: null },
    {
      required_pull_request_reviews: {
        ...protectedBranch.required_pull_request_reviews,
        dismiss_stale_reviews: false,
      },
    },
    { required_linear_history: { enabled: false } },
    { required_conversation_resolution: { enabled: false } },
    { enforce_admins: { enabled: false } },
    { allow_force_pushes: { enabled: true } },
    { allow_deletions: { enabled: true } },
  ]) {
    assert.throws(
      () => verifyBranchProtection('development', { ...protectedBranch, ...change }),
      /Protecao base enfraquecida/,
    );
  }
});
