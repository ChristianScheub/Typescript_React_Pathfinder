/**
 * Workflow Automation Check
 * - Runs npm test (only in full build mode, skips in dev mode)
 * - Dev Mode Detection for faster development workflow
 */

import { execSync } from 'child_process';

export function runWorkflowAutomation() {
  // Determine if we're in dev mode (skip tests for faster startup)
  const isDev = process.env.NODE_ENV === 'development' || process.argv.some(arg => arg.includes('vite'));
  const skipTests = process.env.SKIP_PREBUILD_TESTS === 'true' || isDev;

  console.log('\n\x1b[36m🔍 Running Pre-Build Checks...\x1b[0m\n');
  
  if (skipTests) {
    console.log('\x1b[33m⚠️  Skipping tests (dev mode). Run npm run build to run full checks.\x1b[0m\n');
    return { violations: [], hasTestPhase: false };
  }

  // Run Tests (only in build mode, not in dev mode)
  console.log('Running tests...');
  try {
    execSync('npm test -- --run', { stdio: 'inherit' });
    console.log('\n\x1b[32m✅ All tests passed!\x1b[0m\n');
    return { violations: [], hasTestPhase: true };
  } catch (error) {
    console.error('\n\x1b[31m❌ Tests failed!\x1b[0m\n');
    console.error('\x1b[33mPlease fix the test failures above before building.\x1b[0m\n');
    process.exit(1);
  }
}
