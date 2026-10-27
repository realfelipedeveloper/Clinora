import { readFileSync } from 'node:fs';
import { verifyBranchProtection } from './branch-protection.mjs';

try {
  const protection = JSON.parse(readFileSync(0, 'utf8'));
  const branch = process.argv[2];
  verifyBranchProtection(branch, protection);
  console.log(`Protecao ${branch} OK`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
