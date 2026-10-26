import { publishQualityStatus, waitForQualityRun } from './quality-status.mjs';

try {
  const options = {
    repository: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN,
  };
  const run = await waitForQualityRun(process.env.QUALITY_RUN_ID, options);
  const result = await publishQualityStatus(run, options);
  console.log(`Status de qualidade: ${result}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
