import { readFileSync } from 'node:fs';
import { publishQualityStatus } from './quality-status.mjs';

try {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const result = await publishQualityStatus(event.workflow_run, {
    repository: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN,
  });
  console.log(`Status de qualidade: ${result}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
