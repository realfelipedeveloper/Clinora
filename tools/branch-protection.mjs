const BASE_BRANCHES = new Set(['development', 'homologation', 'main']);

export function verifyBranchProtection(branch, protection) {
  if (!BASE_BRANCHES.has(branch)) {
    throw new Error('Branch base invalida');
  }
  const checks = protection?.required_status_checks;
  if (checks?.strict !== true || !checks.contexts?.includes('clinora/qualidade')) {
    throw new Error('Status clinora/qualidade nao obrigatorio');
  }
  const reviews = protection.required_pull_request_reviews;
  if (
    !reviews ||
    reviews.dismiss_stale_reviews !== true ||
    !Number.isInteger(reviews.required_approving_review_count) ||
    reviews.required_approving_review_count < 0 ||
    protection.required_linear_history?.enabled !== true ||
    protection.required_conversation_resolution?.enabled !== true ||
    protection.enforce_admins?.enabled !== true ||
    protection.allow_force_pushes?.enabled !== false ||
    protection.allow_deletions?.enabled !== false
  ) {
    throw new Error('Protecao base enfraquecida');
  }
  return true;
}
