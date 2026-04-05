/**
 * Container Components Checker
 * - No input/button HTML tags in containers (must be in UI components)
 * - No UI component imports in containers (only Views and Services)
 * - Tag count limits (div, p, span, label, h1, h2)
 * - Naming convention for Components
 */

import fs from 'fs';
import path from 'path';
import { walkDir, getProjectPaths, getRelativePath } from './checkUtils.js';

export function checkContainerComponents() {
  const violations = [];
  const { projectRoot, srcDir } = getProjectPaths();

  // 1. Component File Naming Convention Check
  console.log('Checking components folder naming convention...');
  const componentsDir = path.join(srcDir, 'components');
  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      const fileName = path.basename(file);
      // Only check .tsx files
      if (!fileName.endsWith('.tsx')) {
        return;
      }
      
      // App.tsx is allowed as an exception (root component)
      if (fileName === 'App.tsx') {
        return;
      }
      
      // Check naming convention
      const isValid = fileName.endsWith('Container.tsx');

      if (!isValid) {
        violations.push(
          `FileName Check (components): File '${getRelativePath(file, projectRoot)}' does not match naming convention. ` +
          `Expected: *Container.tsx`
        );
      }
    });
  }

  // 2. Layer Boundary Check - Containers must not import from ui/
  console.log('Checking layer boundary: containers must not import UI components...');

  const FORBIDDEN_IMPORTS_IN_CONTAINERS = [
    { pattern: /from\s+['"][^'"]*\/ui\//, label: 'ui/' },
  ];

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');

      FORBIDDEN_IMPORTS_IN_CONTAINERS.forEach(({ pattern, label }) => {
        if (pattern.test(content)) {
          violations.push(
            `Layer Boundary Check (containers): File '${relFile}' imports from forbidden layer '${label}'. ` +
            `Containers must not directly import UI components. All UI must flow through Views to maintain clean architecture.`
          );
        }
      });
    });
  }

  // 2.2. Icon Import Check - Containers must not import icons (icons belong in UI/View components)
  console.log('Checking icon import restrictions in containers...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      if (!relFile.endsWith('Container.tsx')) return;

      const content = fs.readFileSync(file, 'utf8');

      // Regex patterns for common icon libraries
      const iconPatterns = [
        { regex: /import\s+{\s*([^}]+)\s*}\s+from\s+['"]lucide-react['"]/g, source: 'lucide-react' },
        { regex: /import\s+{\s*([^}]+)\s*}\s+from\s+['"]react-icons\/[^'"]*['"]/g, source: 'react-icons' },
        { regex: /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@ui\/Icons['"]/g, source: '@ui/Icons' },
      ];

      let totalIconImports = 0;

      iconPatterns.forEach(({ regex, source }) => {
        let match;
        while ((match = regex.exec(content)) !== null) {
          // Count individual icons imported (comma-separated list)
          const imports = match[1].split(',').map(i => i.trim()).filter(i => i);
          totalIconImports += imports.length;
        }
      });

      if (totalIconImports > 3) {
        violations.push(
          `Icon Import Check (containers): File '${relFile}' imports ${totalIconImports} icons. ` +
          `Maximum allowed is 3. Containers must not contain icon logic. ` +
          `Icons belong in UI components or Views. Extract icon usage into sub-components and import them instead.`
        );
      }
    });
  }

  // 2.5. Service Facade Import Check - Only whole services can be imported, not individual logic files
  console.log('Checking service import restrictions in containers...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');

      // Regex: Matches imports from services/ with more than one slash after that (e.g., /services/TaxService/logic/...)
      // Pattern explanation:
      // - from\s+['"]: matches "from" keyword
      // - [^/]*\/services\/ : matches path to services folder
      // - [^'"]+ : matches the rest of the path inside quotes
      // Check if path has multiple slashes after /services/
      const serviceImportPattern = /from\s+['"]([^'"]*\/services\/[^'"]+\/[^'"]+\/)/;

      const matches = serviceImportPattern.exec(content);
      if (matches) {
        const importPath = matches[1];
        violations.push(
          `Service Import Check (containers): File '${relFile}' contains deep service import: '${importPath}'. ` +
          `Services must be imported as complete facades. ` +
          `BAD: import { calc } from '../services/TaxService/logic/Calc.ts' ` +
          `GOOD: import TaxService from '../services/TaxService'`
        );
      }
    });
  }

  // 3. HTML Tag Restrictions in Containers
  console.log('Checking HTML tag restrictions in containers...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');

      // Only check Container files
      if (!relFile.endsWith('Container.tsx')) return;

      // Check for forbidden input and button tags
      if (/<input[\s>]/i.test(content)) {
        violations.push(
          `Input Tag Check (containers): File '${relFile}' contains <input> tags. ` +
          `Input fields must be in UI components, not in Container components.`
        );
      }

      if (/<button[\s>]/i.test(content)) {
        violations.push(
          `Button Tag Check (containers): File '${relFile}' contains <button> tags. ` +
          `Buttons must be in UI components, not in Container components.`
        );
      }
    });
  }

  // 3.5. Storage & Database Access Restrictions in Containers
  console.log('Checking storage and database operations in containers...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');

      // Only check Container files
      if (!relFile.endsWith('Container.tsx')) return;

      // Check for localStorage, sessionStorage, indexedDB operations
      if (/localStorage\./i.test(content)) {
        violations.push(
          `Storage Access Check (containers): File '${relFile}' accesses localStorage. ` +
          `All storage operations must be delegated to a Service. ` +
          `Create a dedicated Service and use dependency injection instead.`
        );
      }

      if (/sessionStorage\./i.test(content)) {
        violations.push(
          `Storage Access Check (containers): File '${relFile}' accesses sessionStorage. ` +
          `All storage operations must be delegated to a Service. ` +
          `Create a dedicated Service and use dependency injection instead.`
        );
      }

      if (/indexedDB\./i.test(content)) {
        violations.push(
          `Database Access Check (containers): File '${relFile}' accesses indexedDB. ` +
          `All database operations must be delegated to a Service. ` +
          `Create a dedicated Service and use dependency injection instead.`
        );
      }
    });
  }

  // 4. Tag Count Check (div, p, span, label, h1, h2)
  console.log('Checking tag count limits in components...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      // Check div, p, span, label, h1, h2 tag count
      const tagMatches = content.match(/<(div|p|span|label|h1|h2)[\s>]/g) || [];
      const tagCount = tagMatches.length;
      const lineCount = lines.length;
      const maxAllowed = Math.max(5, Math.ceil(lineCount * 0.1));

      if (tagCount > maxAllowed) {
        violations.push(
          `Tag Count Check (components): File '${relFile}' has ${tagCount} div/p/span/label/h1/h2 tags, ` +
          `but maximum allowed is ${maxAllowed} (10 or 10% of ${lineCount} lines). ` +
          `Consider breaking this component into smaller sub-components or even better stupid UI components with views.`
        );
      }
    });
  }

  // 5. Lines of Code Check - Containers must not exceed 200 lines
  console.log('Checking lines of code limit in containers...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      if (!relFile.endsWith('Container.tsx')) return;

      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const lineCount = lines.length;
      const maxLines = 200;

      if (lineCount > maxLines) {
        violations.push(
          `LOC Check (containers): File '${relFile}' has ${lineCount} lines of code, ` +
          `but maximum allowed is ${maxLines}. ` +
          `Break down this container into smaller, focused containers or extract logic into custom hooks.`
        );
      }
    });
  }

  // 6. Hook Count Check - Containers must not exceed 7 hooks
  console.log('Checking hook count limit in containers...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      if (!relFile.endsWith('Container.tsx')) return;

      const content = fs.readFileSync(file, 'utf8');
      
      // Regex: Match const [something] = useState|useMemo|useCallback|useRef
      const hookPattern = /const\s+\[[^\]]+\]\s*=\s*(useState|useMemo|useCallback|useRef)/g;
      const hookMatches = content.match(hookPattern) || [];
      const hookCount = hookMatches.length;
      const maxHooks = 7;

      if (hookCount > maxHooks) {
        violations.push(
          `Hook Count Check (containers): File '${relFile}' has ${hookCount} hooks (useState/useMemo/useCallback/useRef), ` +
          `but maximum allowed is ${maxHooks}. ` +
          `Too many hooks indicate a container doing too much. Extract logic into custom hooks or split into multiple containers.`
        );
      }
    });
  }

  // 7. Import Count Check - Containers must not exceed 10 imports
  console.log('Checking import count limit in containers...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      if (!relFile.endsWith('Container.tsx')) return;

      const content = fs.readFileSync(file, 'utf8');
      
      // Count import statements (lines starting with 'import')
      const importPattern = /^import\s+/m;
      const lines = content.split('\n');
      const importLines = lines.filter((line) => importPattern.test(line.trim()));
      const importCount = importLines.length;
      const maxImports = 10;

      if (importCount > maxImports) {
        violations.push(
          `Import Count Check (containers): File '${relFile}' has ${importCount} import statements, ` +
          `but maximum allowed is ${maxImports}. ` +
          `Too many imports indicate mixing too many concerns (icons, services, components, utilities). ` +
          `Consolidate imports or split container into focused, single-responsibility containers.`
        );
      }
    });
  }

  // 8. JSX Nesting Depth Check - Containers must not exceed 4 levels of nesting
  console.log('Checking JSX nesting depth in containers...');

  const MAX_DEPTH_LEVELS = 4;
  const SPACES_PER_LEVEL = 2; // React typically uses 2-space indents
  const MAX_SPACES = (MAX_DEPTH_LEVELS + 1) * SPACES_PER_LEVEL; // Starting from level 7
  

  const depthRegex = new RegExp(`^(\\s{${MAX_SPACES},}|\\t{${MAX_DEPTH_LEVELS + 1},})\\s*<`, 'm');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      if (!relFile.endsWith('Container.tsx')) return;

      const content = fs.readFileSync(file, 'utf8');

      // Check for lines with JSX tags nested too deep
      const lines = content.split('\n');
      let maxDepthFound = 0;
      let deepestLineNumber = 0;

      lines.forEach((line, idx) => {
        // Count leading spaces/tabs to determine nesting level
        const leadingWhitespace = line.match(/^(\s*)/)[1];
        const spaceCount = leadingWhitespace.replace(/\t/g, '  ').length; // Convert tabs to spaces
        const depthLevel = Math.ceil(spaceCount / SPACES_PER_LEVEL);

        // Check if this line contains a JSX tag
        if (/<[A-Z\/]/.test(line) && depthLevel > maxDepthFound) {
          maxDepthFound = depthLevel;
          deepestLineNumber = idx + 1;
        }
      });

      if (maxDepthFound > MAX_DEPTH_LEVELS) {
        violations.push(
          `JSX Nesting Depth Check (containers): File '${relFile}' has JSX nested ${maxDepthFound} levels deep (line ${deepestLineNumber}), ` +
          `but maximum allowed is ${MAX_DEPTH_LEVELS}. ` +
          `Extract deeply nested JSX into sub-components to keep the JSX tree shallow and readable. ` +
          `Deep nesting makes containers harder to understand and maintain.`
        );
      }
    });
  }

  return violations;
}
