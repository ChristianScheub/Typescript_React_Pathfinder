/**
 * View & UI Components Checker
 * - Logic/State/Redux/Navigation Hook Check
 * - Layer Boundary Check for Views & UI (no services, no stateManagement)
 * - Naming convention for Views
 * - Naming convention for UI files
 */

import fs from 'fs';
import path from 'path';
import { walkDir, getProjectPaths, getRelativePath } from './checkUtils.js';

export function checkViewUIComponents() {
  const violations = [];
  const { projectRoot, srcDir } = getProjectPaths();

  // 1. View File Naming Convention Check
  console.log('Checking views folder naming convention...');
  const viewsDir = path.join(srcDir, 'views');
  if (fs.existsSync(viewsDir)) {
    walkDir(viewsDir, (file) => {
      const fileName = path.basename(file);
      // Skip directories and allow only specific extensions
      if (
        !file.endsWith('.tsx') &&
        !file.endsWith('.css') &&
        !file.endsWith('.ts')
      ) {
        return;
      }
      // Check naming convention
      const isValid =
        fileName.endsWith('View.tsx') ||
        fileName.endsWith('ViewProps.tsx') ||
        fileName.endsWith('.css');

      if (!isValid) {
        violations.push(
          `FileName Check (views): File '${getRelativePath(file, projectRoot)}' does not match naming convention. ` +
            `Expected: *View.tsx, *ViewProps.tsx, or *.css`
        );
      }
    });
  }

  // 2. UI File Naming Convention Check
  console.log('Checking ui folder naming convention...');
  const uiDir = path.join(srcDir, 'ui');
  if (fs.existsSync(uiDir)) {
    walkDir(uiDir, (file) => {
      const fileName = path.basename(file);
      // Check if it's a .tsx or .css file
      const isValid = fileName.endsWith('.tsx') || fileName.endsWith('.css');

      if (!isValid) {
        violations.push(
          `FileName Check (ui): File '${getRelativePath(file, projectRoot)}' does not match naming convention. ` +
            `Expected: *.tsx or *.css`
        );
      }
    });
  }

  // 3. Logic/State/Redux/Navigation Hook Check in ui and views folders
  console.log('Checking ui and views folders for forbidden logic/state/redux/navigation hooks...');

  const FORBIDDEN_PATTERNS = [
    // React Hooks (Logik-Bausteine)
    { pattern: /\buseEffect\b/, label: 'useEffect' },
    { pattern: /\buseState\b/, label: 'useState' },
    { pattern: /\buseCallback\b/, label: 'useCallback' },
    { pattern: /\buseMemo\b/, label: 'useMemo' },
    { pattern: /\buseContext\b/, label: 'useContext' },
    // Redux
    { pattern: /\buseSelector\b/, label: 'useSelector' },
    { pattern: /\buseReducer\b/, label: 'useReducer' },
    { pattern: /\bRootState\b/, label: 'RootState' },
    // Navigation
    { pattern: /\buseLocation\b/, label: 'useLocation' },
    { pattern: /\bNavigateFunction\b/, label: 'NavigateFunction' },
  ];

  // Files to skip entirely (relative paths from project root, using forward slashes)
  const HOOK_CHECK_IGNORED_FILES = [
    'src/views/Navbar/NavbarView.tsx',
  ];

  // Per-file pattern allowlists (relative paths → set of allowed labels)
  const HOOK_CHECK_FILE_ALLOWLIST = {
    'src/views/settings/SettingsView.tsx': new Set(['useNavigate', 'NavigateFunction']),
  };

  const foldersToCheck = ['ui', 'views'];

  foldersToCheck.forEach((folderName) => {
    const folderPath = path.join(srcDir, folderName);
    if (!fs.existsSync(folderPath)) return;

    walkDir(folderPath, (file) => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);

      // Skip ignored files entirely
      if (HOOK_CHECK_IGNORED_FILES.includes(relFile)) return;

      const content = fs.readFileSync(file, 'utf8');
      const allowedLabels = HOOK_CHECK_FILE_ALLOWLIST[relFile] ?? new Set();

      FORBIDDEN_PATTERNS.forEach(({ pattern, label }) => {
        if (allowedLabels.has(label)) return;
        if (pattern.test(content)) {
          violations.push(
            `Logic/Hook Check (${folderName}): File '${relFile}' contains forbidden pattern '${label}'. ` +
            `Files in '${folderName}/' must be pure presentational components without logic, state, redux or navigation hooks.`
          );
        }
      });
    });
  });

  // 4. Inline Styles Check - No inline styles allowed in View & UI components
  console.log('Checking for inline styles in View and UI components...');

  foldersToCheck.forEach((folderName) => {
    const folderPath = path.join(srcDir, folderName);
    if (!fs.existsSync(folderPath)) return;

    walkDir(folderPath, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');

      // Check for inline style attributes (style={{ ... }} or style="...")
      // But allow CSS custom properties (--xxx) for dynamic values
      if (/style\s*=\s*"/.test(content)) {
        // String styles are always forbidden
        violations.push(
          `Inline Styles Check (${folderName}): File '${relFile}' contains inline style strings. ` +
          `Styles must be imported from a separate CSS file using className, not defined inline. ` +
          `Create a corresponding .css file and import it with className bindings.`
        );
      }

      // For object styles, check if they contain more than just CSS custom properties
      // Pattern: style={{ --property: value, ... but NOT regular CSS properties }}
      const styleObjectMatches = content.match(/style\s*=\s*{\s*[^}]*}/g) || [];
      styleObjectMatches.forEach((match) => {
        // Check if this contains regular CSS properties (not just --xxx custom properties)
        // Allow style={{ '--progress': ... }} but disallow style={{ width: ... }}
        const containsRegularProps = /:\s*['"`]?(?!-)[a-zA-Z]/i.test(match);
        
        if (containsRegularProps) {
          violations.push(
            `Inline Styles Check (${folderName}): File '${relFile}' contains inline style attributes. ` +
            `Styles must be imported from a separate CSS file using className, not defined inline. ` +
            `Create a corresponding .css file and import it with className bindings.`
          );
        }
      });

      // Check for <style> tags
      if (/<style[\s>]/.test(content)) {
        violations.push(
          `Style Tags Check (${folderName}): File '${relFile}' contains <style> tags. ` +
          `All styles must be in external CSS files, not embedded in components.`
        );
      }
    });
  });

  // 4. Layer Boundary Check - Views & UI must not import from services or stateManagement
  console.log('Checking layer boundary import rules for Views & UI...');

  const PRESENTATION_LAYER_FOLDERS = ['views', 'ui'];
  const FORBIDDEN_IMPORTS_IN_PRESENTATION = [
    { pattern: /from\s+['"][^'"]*\/services\//, label: 'services/' },
    { pattern: /from\s+['"][^'"]*\/stateManagement\//, label: 'stateManagement/' },
  ];

  // Per-file import allowlists (relative paths → set of allowed forbidden labels)
  const IMPORT_CHECK_FILE_ALLOWLIST = {
    'src/views/TaxCalculator/TaxCalculatorView.tsx': new Set(['services/']),
  };

  PRESENTATION_LAYER_FOLDERS.forEach((folderName) => {
    const folderPath = path.join(srcDir, folderName);
    if (!fs.existsSync(folderPath)) return;

    walkDir(folderPath, (file) => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');
      const allowedLabels = IMPORT_CHECK_FILE_ALLOWLIST[relFile] ?? new Set();

      FORBIDDEN_IMPORTS_IN_PRESENTATION.forEach(({ pattern, label }) => {
        if (allowedLabels.has(label)) return;
        if (pattern.test(content)) {
          violations.push(
            `Layer Boundary Check (${folderName}): File '${relFile}' imports from forbidden layer '${label}'. ` +
            `Presentational files must not depend on services or state management directly.`
          );
        }
      });
    });
  });

  // 5. Minimal Component Code Check - Prevent wrapper-only components
  console.log('Checking for minimal wrapper-only components...');

  foldersToCheck.forEach((folderName) => {
    const folderPath = path.join(srcDir, folderName);
    if (!fs.existsSync(folderPath)) return;

    walkDir(folderPath, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');
      
      // Find the export statement
      const exportMatch = content.match(/\nexport\s+(?:function|const|default)/);
      if (!exportMatch) return;

      // Get code after export
      const exportIndex = content.indexOf(exportMatch[0]);
      const codeAfterExport = content.substring(exportIndex);
      const lines = codeAfterExport.split('\n');

      // Count non-empty, non-whitespace-only lines (excluding import/export lines)
      let contentLineCount = 0;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('//') && trimmed !== '}' && trimmed !== ');') {
          contentLineCount++;
          // Stop after first meaningful export line
          if (contentLineCount > 3) break;
        }
      }

      // If there are 3 or fewer lines of actual content after export, it's too minimal
      if (contentLineCount <= 3 && contentLineCount > 0) {
        violations.push(
          `Minimal Component Check (${folderName}): File '${relFile}' exports a component with only ${contentLineCount} lines of code. ` +
          `Avoid creating wrapper-only components that just re-export or wrap another component. ` +
          `Import the component directly or merge the logic into the parent component.`
        );
      }
    });
  });

  return violations;
}
