#!/usr/bin/env node

/**
 * Pre-Build Checks Orchestrator
 * 
 * This script coordinates all pre-build checks and validation:
 * 1. Workflow Automation - Runs tests in build mode or skips in dev mode
 * 2. View & UI Components - Checks naming, hooks, and layer boundaries
 * 3. Container Components - Checks HTML restrictions and import rules
 * 4. Service Components - Validates Modular Facade Architecture
 * 5. Code Quality - Checks for magic numbers, console.log, style tags, etc.
 */

import { runWorkflowAutomation } from './scripts/workflowAutomation.js';
import { checkViewUIComponents } from './scripts/viewUIComponentsChecker.js';
import { checkContainerComponents } from './scripts/containerComponentsChecker.js';
import { checkServiceComponents } from './scripts/serviceComponentsChecker.js';
import { checkCodeQuality } from './scripts/codeQualityChecker.js';

async function runAllChecks() {
  // Step 1: Workflow Automation (Tests)
  const workflowResult = runWorkflowAutomation();

  // Collect all violations from all checkers
  const allViolations = [];

  // Step 2: View & UI Components Checks
  console.log('\n✓ Running View & UI Components checks...');
  const viewUIViolations = checkViewUIComponents();
  allViolations.push(...viewUIViolations);

  // Step 3: Container Components Checks
  console.log('\n✓ Running Container Components checks...');
  const containerViolations = checkContainerComponents();
  allViolations.push(...containerViolations);

  // Step 4: Service Components Checks
  console.log('\n✓ Running Service Components checks...');
  const serviceViolations = checkServiceComponents();
  allViolations.push(...serviceViolations);

  // Step 5: Code Quality Checks
  console.log('\n✓ Running Code Quality checks...');
  const codeQualityViolations = checkCodeQuality();
  allViolations.push(...codeQualityViolations);

  // Output results
  if (allViolations.length > 0) {
    console.error('\n\x1b[31m❌ Pre-Build Checks failed!\x1b[0m\n');
    allViolations.forEach((msg) => console.error('- ' + msg));
    console.error('\n\x1b[33mPlease fix the violations above before building.\x1b[0m\n');
    process.exit(1);
  }

  console.log('\n\x1b[32m✅ All Pre-Build Checks passed!\x1b[0m\n');
  process.exit(0);
}

// Run all checks
runAllChecks().catch((error) => {
  console.error('Error running pre-build checks:', error);
  process.exit(1);
});