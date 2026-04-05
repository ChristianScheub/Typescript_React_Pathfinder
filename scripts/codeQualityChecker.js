/**
 * Code Quality Checker
 * - Magic Number detection (identifies unnamed numeric constants)
 * - console.log violations (should use Logger instead)
 * - Style tags check (should use CSS classes)
 * - Tag count for UI components
 */

import fs from 'fs';
import path from 'path';
import { walkDir, getProjectPaths, getRelativePath } from './checkUtils.js';

export function checkCodeQuality() {
  const violations = [];
  const { projectRoot, srcDir } = getProjectPaths();

  // 1. Magic Number Check - calculator files in services/
  console.log('Checking services for magic numbers...');

  const servicesDir = path.join(srcDir, 'services');
  
  // Config files are exempt - they ARE the named-constant definitions
  const MAGIC_NUMBER_FILE_IGNORE_PATTERNS = [
    /Config\.ts$/,
    /config\.ts$/,
    /\.test\./,
  ];

  // Numbers that are universally acceptable without a named constant:
  //   12  → months per year
  //   0   → zero/guard value
  //   1   → identity/unit
  //   100 → percentage base
  //   2   → factor (e.g. "both ways")
  //   0.01 → convergence epsilon / rounding guard
  const MAGIC_NUMBER_WHITELIST = new Set([0, 1, 2, 12, 100]);
  const MAGIC_NUMBER_EPSILON = 0.01; // any float <= this is treated as a convergence guard

  // Matches a bare numeric literal used as an operand in an arithmetic expression
  const MAGIC_NUMBER_REGEX =
    /(?:[\*\/\+\-]\s*|-\s*)(\d+(?:\.\d+)?)(?!\s*[:,}\]])/g;

  if (fs.existsSync(servicesDir)) {
    walkDir(servicesDir, (file) => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
      if (MAGIC_NUMBER_FILE_IGNORE_PATTERNS.some((p) => p.test(file))) return;

      const relFile = getRelativePath(file, projectRoot);
      const lines = fs.readFileSync(file, 'utf8').split('\n');

      lines.forEach((line, idx) => {
        // Skip comment lines and import lines
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import')) return;

        // Strip inline comments before matching
        const codePart = line.replace(/\/\/.*$/, '');

        let m;
        MAGIC_NUMBER_REGEX.lastIndex = 0;
        while ((m = MAGIC_NUMBER_REGEX.exec(codePart)) !== null) {
          const num = parseFloat(m[1]);
          if (MAGIC_NUMBER_WHITELIST.has(num)) continue;
          if (num <= MAGIC_NUMBER_EPSILON) continue; // convergence epsilon guard

          // Warning only – does not block the build
          console.warn(
            `\x1b[33m⚠ Magic Number Check (services): File '${relFile}' line ${idx + 1}: ` +
            `bare number '${m[1]}' used directly in calculation. Consider extracting it into a named constant in a *Config.ts file.\x1b[0m`
          );
        }
      });
    });
  }

  // 2. Console Log Check
  console.log('Checking for console.log violations...');
  const consoleLogViolations = [];
  
  walkDir(srcDir, (file) => {
    if (
      file.includes(`${path.sep}scripts${path.sep}`) ||
      file.includes(`${path.sep}workers${path.sep}`) ||
      file.includes('.test.') || // Allow console.log in .test. files
      file.includes('logger') // Allow console.log in logger files
    ) {
      return;
    }
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    
    const content = fs.readFileSync(file, 'utf8');
    if (/console\.log\(/.test(content)) {
      const relFile = getRelativePath(file, projectRoot);
      consoleLogViolations.push(
        `Console Log Check: Found 'console.log' in file ${relFile}. Use the Logger service instead.`
      );
    }
  });

  if (consoleLogViolations.length > 0) {
    violations.push(...consoleLogViolations);
  }

  // 3. Style Tags & Div/P/Span Tag Count Check in UI components
  console.log('Checking for style tags in UI components...');

  const STYLE_AND_TAG_CHECK_FOLDERS = ['ui', 'components'];

  STYLE_AND_TAG_CHECK_FOLDERS.forEach((folderName) => {
    const folderPath = path.join(srcDir, folderName);
    if (!fs.existsSync(folderPath)) return;

    walkDir(folderPath, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      // Check for style tags (aber nicht className)
      if (/<style[\s>]/.test(content)) {
        violations.push(
          `Style Tags Check (${folderName}): File '${relFile}' contains <style> tags. ` +
          `Use CSS classes instead of inline style tags.`
        );
      }

      // Check div, p, span, label, h1, h2 tag count
      const tagMatches = content.match(/<(div|p|span|label|h1|h2)[\s>]/g) || [];
      const tagCount = tagMatches.length;
      const lineCount = lines.length;
      const maxAllowed = Math.max(5, Math.ceil(lineCount * 0.1));

      if (tagCount > maxAllowed) {
        violations.push(
          `Tag Count Check (${folderName}): File '${relFile}' has ${tagCount} div/p/span/label/h1/h2 tags, ` +
          `but maximum allowed is ${maxAllowed} (10 or 10% of ${lineCount} lines). ` +
          `Consider breaking this component into smaller sub-components.`
        );
      }
    });
  });

  // 4. Absolute Import Path Check - All imports must use defined @ aliases
  console.log('Checking for absolute import paths with proper @ aliases...');

  // Define allowed import aliases
  const allowedAliases = ['@services', '@components', '@views', '@ui', '@config', '@types', '@hooks'];

  walkDir(srcDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    if (file.includes('.test.')) return; // Allow any imports in test files

    const relFile = getRelativePath(file, projectRoot);
    const content = fs.readFileSync(file, 'utf8');

    // Regex to find all import statements
    const importRegex = /^import\s+.*?\s+from\s+['"]([^'"]+)['"]/gm;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      // Skip external packages (packages without @ prefix)
      // e.g. 'react', 'react-dom/client', 'vite', etc. - these are allowed
      if (!importPath.startsWith('@')) {
        continue; // External package - allowed
      }

      // Skip scoped npm packages (e.g. @capacitor/core, @capgo/navigation-bar)
      // These start with @ but are not project aliases - they exist in node_modules
      const scopedPkgMatch = importPath.match(/^(@[^/]+\/[^/]+)/);
      if (scopedPkgMatch) {
        const pkgDir = path.join(projectRoot, 'node_modules', scopedPkgMatch[1]);
        if (fs.existsSync(pkgDir)) {
          continue; // Scoped npm package - allowed
        }
      }

      // Check 1: No relative paths allowed (../, ./, /)
      if (importPath.startsWith('../') || importPath.startsWith('./') || importPath.startsWith('/')) {
        violations.push(
          `Absolute Import Check: File '${relFile}' uses relative import path '${importPath}'. ` +
          `All imports must use absolute paths with @ aliases. ` +
          `GOOD: 'import Model from "@services/model"'`
        );
        continue;
      }

      // Check 2: Must use one of our valid aliases
      const hasValidAlias = allowedAliases.some(alias => importPath.startsWith(alias));
      if (!hasValidAlias) {
        violations.push(
          `Import Alias Check: File '${relFile}' uses invalid import path '${importPath}'. ` +
          `Must use: @services, @components, @views, @ui, @config, @types, @hooks. ` +
          `GOOD: 'import Model from "@services/model"'`
        );
        continue;
      }

      // Check 3: No deep imports into service logic folders (unless FROM inside that service)
      // e.g., you can't do: import X from '@services/logger/logic/LoggerImpl' (unless you're inside logger/)
      // BUT within a service facade (index.ts), importing from your own logic/ is allowed
      if (importPath.startsWith('@services/')) {
        const parts = importPath.split('/');
        const importedService = parts[1]; // e.g., 'logger' from '@services/logger/logic/...'
        
        // Check if this file is inside a service folder
        const isFileInsideService = relFile.includes(`services/${importedService}/`);
        
        // If accessing logic or interface from OUTSIDE the service, that's forbidden
        if (!isFileInsideService && parts.length > 2 && (parts[2] === 'logic' || parts.includes('IService'))) {
          violations.push(
            `Deep Service Import Check: File '${relFile}' bypasses service facade with '${importPath}'. ` +
            `Import service facades only. GOOD: '@services/logger'`
          );
        }
      }
    }
  });

  // 5. Hardcoded Text Check (i18n migration)
  console.log('Checking for hardcoded text strings (should use i18next)...');

  const HARDCODED_TEXT_CHECK_FOLDERS = ['ui', 'views'];
  const HARDCODED_TEXT_IGNORE_PATTERNS = [
    /\.test\./,
    /Logger/,
    /\.css\.ts$/,
  ];

  // Common technical terms and characters that are allowed (not user-facing text)
  const ALLOWED_HARDCODED = new Set([
    // Single characters and symbols
    ':', ',', '.', '!', '?', ';', '/', '-', '_', '+', '=', '(', ')', '[', ']', '{', '}', '$', '%', '@', '#', '&',
    // Empty strings
    '',
    // Aria labels, IDs (technical)
    'id', 'role', 'aria-label', 'className', 'src', 'href', 'target', 'rel', 'type', 'value',
    // Common variable names and technical terms
    'false', 'true', 'null', 'undefined', 'px', 'ms', 'auto', 'center',
    // UUID/ID patterns
    'msg-', 'user', 'assistant', 'chat-message',
    // Emojis and symbols (when used as standalone)
    '⚡', '🧠', '⚙', '💬', '🔧',
    // CSS class names (kebab-case technical identifiers)
    // These are filtered by containing hyphens and being fully lowercase/hyphenated
  ]);

  HARDCODED_TEXT_CHECK_FOLDERS.forEach((folderName) => {
    const folderPath = path.join(srcDir, folderName);
    if (!fs.existsSync(folderPath)) return;

    // Helper to determine if a string looks like user-facing hardcoded text
    function isHardcodedText(str) {
      if (!str || str.length < 3) return false;
      if (ALLOWED_HARDCODED.has(str)) return false;
      if (str.startsWith('--')) return false; // CSS custom properties
      // HTML attribute values (rel, target, type values)
      if (/^(noopener|noreferrer|nofollow|_blank|_self|submit|button|reset|text|password|email|number)(\s+(noopener|noreferrer|nofollow|_blank|_self))*$/.test(str)) return false;
      // CSS class names (kebab-case)
      if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(str) && str.includes('-')) return false;
      // Translation keys (namespace.key format)
      if (str.includes('.') && /^[a-zA-Z][a-zA-Z0-9._]*$/.test(str)) return false;
      // Template literals with interpolation
      if (str.includes('${')) return false;
      // URLs or paths
      if (str.startsWith('http') || str.startsWith('/') || str.startsWith('.')) return false;
      // File extensions or format codes (e.g. ".json", "SHA256")
      if (/^\.[a-z]+$/.test(str) || /^[A-Z0-9]+$/.test(str)) return false;
      // Locale format strings (e.g. "2-digit", "en-US")
      if (/^[a-z]+-[a-z0-9]+$/i.test(str) && str.length < 15) return false;
      // Must contain at least one letter
      if (!/[a-zA-ZäöüÄÖÜß]/.test(str)) return false;
      // Single-word variable/identifier names (camelCase, PascalCase, snake_case)
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str)) return false;
      // If we get here, the string has multiple words or special characters → likely user-facing
      return true;
    }

    walkDir(folderPath, (file) => {
      if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
      if (HARDCODED_TEXT_IGNORE_PATTERNS.some((p) => p.test(file))) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      // Check each line for hardcoded strings that should be i18n keys
      lines.forEach((line, idx) => {
        // Skip imports, comments, and type declarations
        if (line.trim().startsWith('import ') || 
            line.trim().startsWith('//') || 
            line.trim().startsWith('*') ||
            line.trim().startsWith('interface ') ||
            line.trim().startsWith('type ')) {
          return;
        }

        // Skip lines that already use i18next translation function
        if (/\bt\(['"]/m.test(line) || /useTranslation/m.test(line)) {
          return;
        }

        // Skip lines that are clearly className, CSS, or style-related
        if (line.includes('className') || 
            line.includes('class=') || 
            line.includes('[`') ||
            line.includes('style') ||
            line.includes('CSS')) {
          return;
        }

        // Skip lines with titleKey, descriptionKey, or other *Key props (i18n keys, not hardcoded text)
        if (line.includes('Key=') || line.includes('Key:')) {
          return;
        }

        // --- Check A: String literals in quotes (props like title="...", placeholder="...") ---
        // Use lookbehind to ensure we match actual string values (after =, (, :, ,, [, or whitespace)
        // This prevents matching text between two separate JSX attributes
        const stringRegex = /(?<=[=(,:\[\s])(['"])([^'"]{3,}?)\1/g;
        let match;

        while ((match = stringRegex.exec(line)) !== null) {
          const stringContent = match[2].trim();

          // Skip if it's in comment
          if (line.substring(0, match.index).includes('//')) continue;

          if (isHardcodedText(stringContent)) {
            violations.push(
              `Hardcoded Text Check (${folderName}): File '${relFile}' line ${idx + 1} contains potential hardcoded text: "${stringContent}". ` +
              `Use i18next translation function instead: t('namespace.key'). ` +
              `Add the text to src/i18n/locales/de.json and en.json, then use useTranslation() hook to access it.`
            );
          }
        }

        // --- Check B: JSX text content between tags (e.g. <p>Some text</p>) ---
        const jsxTextRegex = />([^<>{}`]+)</g;
        let jsxMatch;

        while ((jsxMatch = jsxTextRegex.exec(line)) !== null) {
          const textContent = jsxMatch[1].trim();

          // Skip empty, whitespace-only, or very short
          if (textContent.length < 3) continue;

          // Skip if it's only special chars, numbers, or braces
          if (!/[a-zA-ZäöüÄÖÜß]/.test(textContent)) continue;

          // Skip single-word camelCase/PascalCase identifiers (component text like {variable})
          if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(textContent)) continue;

          // Skip if the line already uses t() translation
          if (/\bt\(['"]/m.test(line)) continue;

          violations.push(
            `Hardcoded JSX Text Check (${folderName}): File '${relFile}' line ${idx + 1} contains hardcoded JSX text: "${textContent}". ` +
            `Use i18next translation function instead: {t('namespace.key')}. ` +
            `Add the text to src/i18n/locales/de.json and en.json, then use useTranslation() hook to access it.`
          );
        }
      });
    });
  });

  return violations;
}

