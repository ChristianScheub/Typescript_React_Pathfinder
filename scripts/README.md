# Pre-Build Checks System

## Overview

The Pre-Build-Check system has been modularized to ensure better maintainability and readability. The original monolithic `prebuild-check.js` has been split into specialized modules.

## File Structure

```
scripts/
├── checkUtils.js              # Shared utility functions
├── workflowAutomation.js      # Test automation & dev mode
├── viewUIComponentsChecker.js # View & UI component validation
├── containerComponentsChecker.js # Container-specific checks
├── serviceComponentsChecker.js  # Service/Modular Facade validation
├── codeQualityChecker.js       # Code quality & best practices
└── README.md                   # This file

prebuild-check.js              # Orchestrator (imports all modules)
```

## Modules

### 1. **checkUtils.js**
Shared utility functions used by all checkers:
- `walkDir()` - Recursively traverse directories
- `getProjectPaths()` - Return project root and src directory
- `getRelativePath()` - Format paths for error messages

### 2. **workflowAutomation.js**
Runs npm tests and detects dev mode:
- **In build mode**: Executes all tests (`npm test -- --run`)
- **In dev mode**: Skips tests for faster development
- Sets exit code to 1 on test failures

### 3. **viewUIComponentsChecker.js**
Validates View and UI components:
- **FileName checks**: Views must be *View.tsx, *ViewProps.tsx, or .css
- **FileName checks**: UI files must be *.tsx or *.css
- **Logic/Hook checks**: No useState, useEffect, useContext, etc. in Views/UI- **Inline Styles check**: No inline styles allowed - all styles must come from external CSS files
- **Style Tags check**: No `<style>` tags - must use separate CSS files with className bindings- **Layer boundary**: Views/UI must not import from services or stateManagement

### 4. **containerComponentsChecker.js**
Validates containers (the "directors" in the system):
- **FileName checks**: Components must be *Container.tsx
- **Import restrictions**: Must not import from ui/
- **Service import restrictions**: Services must be imported as complete facades, not from internal logic files
  - BAD: `import { calc } from '../services/TaxService/logic/Calc.ts'`
  - GOOD: `import TaxService from '../services/TaxService'`
- **HTML tag restrictions**: No `<input>` or `<button>` tags directly in containers
- **Tag count limits**: Max 10% or 10 structural tags (div, p, span, label, h1, h2)

### 5. **serviceComponentsChecker.js**
Validates the Modular Facade Service Architecture:
- **Check 0**: No .ts/.tsx files in services/ root
- **Structure check**: Each service must have:
  - `index.ts` (Facade with exports)
  - `I[ServiceName]Service.ts` (Interface definitions only)
  - `logic/` subfolder (Implementation)
  - `README.md` (Service documentation, min. 50 characters)
- **Type contract check**: Exported const must be explicitly typed with the interface
  - Example: `const TaxService: ITaxService = { ... }`
  - Prevents undeclared methods from being exported
- **Atomization check**: Max 2 exports per logic file
- **Unused exports**: Finds unused exports in services
- **Documentation check**: Each service must have a README.md with description
- **Layer boundary**: Services must not import from UI/Components/Views

### 6. **codeQualityChecker.js**
Code quality and best practice checks:
- **Magic numbers**: Warns about unnamed numeric constants
- **Console.log**: Finds console.log (outside of Logger/tests) and suggests Logger service
- **Style tags**: Warns about `<style>` tags (should use CSS classes)
- **Tag counts**: Same as container check for UI components
- **Absolute imports**: All imports must use @ alias, not relative paths
  - ✅ GOOD: `import TaxService from '@/services/TaxService'`
  - ❌ BAD: `import TaxService from '../../services/TaxService'`
  - ❌ FORBIDDEN: `import { calc } from '@/services/TaxService/logic/Calc'`

## Orchestration

`prebuild-check.js` is the main entry point and:
1. Imports all check modules from `./scripts/`
2. Executes them sequentially
3. Collects all violations
4. Outputs consolidated error messages
5. Determines exit code based on errors

## Execution

```bash
# Automatically on build
npm run build

# Or manually
node prebuild-check.js
```

## Adding New Checks

New checks should be created as a new module in `scripts/`:

```javascript
// scripts/myNewChecker.js
import { getProjectPaths, walkDir, getRelativePath } from './checkUtils.js';

export function checkMyFeature() {
  const violations = [];
  const { projectRoot, srcDir } = getProjectPaths();
  
  // ... validation logic ...
  
  return violations;
}
```

Then import and call it in `prebuild-check.js`:

```javascript
import { checkMyFeature } from './scripts/myNewChecker.js';

// In runAllChecks():
console.log('\n✓ Running My Feature checks...');
const myViolations = checkMyFeature();
allViolations.push(...myViolations);
```

## Check Categories and Responsibilities

| Check | Category | Responsibility |
|-------|----------|-----------------|
| Workflow | Automation | npm test / Dev mode detection |
| View/UI Naming | Presentation Layer | File naming conventions |
| Logic Hooks | Presentation Layer | No useState, useEffect, etc. |
| Inline Styles | Presentation Layer | Styles from external CSS only |
| Style Tags | Presentation Layer | No embedded `<style>` tags |
| View/UI Imports | Architecture | No service/state imports |
| Container Naming | Component Layer | *Container.tsx naming |
| Container Imports | Architecture | No UI imports |
| Service Imports | Architecture | Facade imports only, not internal logic |
| HTML Tags | Component Layer | No raw input/button tags |
| Tag Counts | Component Layer | Structural tag limits |
| Service Structure | Service Layer | Modular Facade pattern |
| Service Documentation | Service Layer | README.md with description |
| Service Type Contract | Service Layer | Interface type enforcement |
| Service Imports | Architecture | No UI/component imports |
| Unused Exports | Service Layer | Dead code detection |
| Service Atomization | Service Layer | Max 2 exports per file |
| Magic Numbers | Code Quality | Unnamed constants detection |
| Console.log | Code Quality | Logger usage enforcement |
| Style Tags | Code Quality | CSS class enforcement |
| Absolute Imports | Code Quality | @ alias enforcement, no relative/deep imports |

## Development Workflow

During local development with Vite (`npm run dev`), tests are skipped for faster feedback cycles. For complete validation, use `npm run build`, which runs all checks.

```bash
# Fast development (tests skipped)
npm run dev

# Complete build with all checks
npm run build
```
