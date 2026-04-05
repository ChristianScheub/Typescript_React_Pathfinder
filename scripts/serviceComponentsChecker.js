/**
 * Service Components Checker
 * - Modular Facade Service Architecture validation
 * - No imports from UI, Components, or Views in services
 * - Service folder structure (I[Service]Service.ts, index.ts, logic/ folder)
 * - Unused exports detection in services
 * - Atomization (max 2 exports per logic file)
 */

import fs from 'fs';
import path from 'path';
import { walkDir, getProjectPaths, getRelativePath } from './checkUtils.js';

export function checkServiceComponents() {
  const violations = [];
  const { projectRoot, srcDir } = getProjectPaths();

  const servicesDir = path.join(srcDir, 'services');
  if (!fs.existsSync(servicesDir)) {
    return violations;
  }

  // 1. Unused Exports Check - services folder
  console.log('Checking services folder for unused exports...');

  // Collect all non-test src files for usage search
  const allSrcFiles = [];
  walkDir(srcDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    if (file.includes('.test.')) return;
    allSrcFiles.push(file);
  });

  // Regex to extract named exports from service files
  const EXPORT_NAME_REGEX =
    /^export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|abstract\s+class)\s+([A-Za-z_$][A-Za-z0-9_$]*)|^export\s*\{\s*([A-Za-z_$][A-Za-z0-9_$]*)/gm;

  walkDir(servicesDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    if (file.includes('.test.')) return;

    const content = fs.readFileSync(file, 'utf8');
    const relFile = getRelativePath(file, projectRoot);

    // Skip service facade index files and interface files - they are meant to be pure exports
    if (relFile.includes('/index.ts') || relFile.includes('IService')) {
      return;
    }

    // Usage content = all non-test src files EXCEPT the file being checked itself
    const usageContents = allSrcFiles
      .filter((f) => f !== file)
      .map((f) => fs.readFileSync(f, 'utf8'))
      .join('\n');

    let match;
    EXPORT_NAME_REGEX.lastIndex = 0;
    while ((match = EXPORT_NAME_REGEX.exec(content)) !== null) {
      const exportName = match[1] || match[2];

      const usageRegex = new RegExp(`\\b${exportName}\\b`);
      if (!usageRegex.test(usageContents)) {
        violations.push(
          `Unused Export Check (services): '${exportName}' in '${relFile}' is exported but never used in src (excluding test files).`
        );
      }
    }
  });

  // 2. Layer Boundary Check - Services must not import from UI, Components, or Views
  console.log('Checking layer boundary import rules for Services...');

  const FORBIDDEN_IMPORTS_IN_SERVICES = [
    { pattern: /from\s+['"][^'"]*\/components\//, label: 'components/' },
    { pattern: /from\s+['"][^'"]*\/views\//, label: 'views/' },
    { pattern: /from\s+['"][^'"]*\/ui\//, label: 'ui/' },
  ];

  walkDir(servicesDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

    const relFile = getRelativePath(file, projectRoot);
    const content = fs.readFileSync(file, 'utf8');

    FORBIDDEN_IMPORTS_IN_SERVICES.forEach(({ pattern, label }) => {
      if (pattern.test(content)) {
        violations.push(
          `Layer Boundary Check (services): File '${relFile}' imports from forbidden layer '${label}'. ` +
          `Services are pure business logic and must not know about UI, components, or views.`
        );
      }
    });
  });

  // 3. Modular Facade Service Architecture Check
  console.log('Checking Modular Facade Service Architecture compliance...');

  // Check 0: No .ts/.tsx files allowed directly in services/ folder
  const filesInServicesRoot = fs.readdirSync(servicesDir);
  const tsFilesInRoot = filesInServicesRoot.filter(name =>
    (name.endsWith('.ts') || name.endsWith('.tsx')) && name !== 'README.md'
  );

  if (tsFilesInRoot.length > 0) {
    violations.push(
      `Service Structure (Modular Facade Pattern): Found individual .ts/.tsx files directly in 'src/services/': [${tsFilesInRoot.join(', ')}]. ` +
      `Services must be organized in folders. Each service must have its own folder with index.ts, I[ServiceName]Service.ts, and a logic/ subfolder.`
    );
  }

  const serviceFolderNames = fs.readdirSync(servicesDir)
    .filter(name => {
      const fullPath = path.join(servicesDir, name);
      try {
        const isDir = fs.statSync(fullPath).isDirectory();
        return isDir && name !== 'README.md';
      } catch {
        return false;
      }
    });

  serviceFolderNames.forEach((serviceName) => {
    const servicePath = path.join(servicesDir, serviceName);
    const files = fs.readdirSync(servicePath);
    const relPath = getRelativePath(servicePath, projectRoot);

    // Check for required files in main service folder
    const hasIndexTs = files.includes('index.ts');
    const interfaceFiles = files.filter(f => f.match(/^I[A-Z]\w*Service\.ts$/));
    const logicFolder = files.includes('logic');

    // Files that should only be in main folder
    const mainFolderFiles = ['index.ts', ...interfaceFiles];
    const otherFiles = files.filter(f =>
      !mainFolderFiles.includes(f) && f !== 'logic' && !f.startsWith('.')
    );

    // Check 1: Must have index.ts (Facade)
    if (!hasIndexTs) {
      violations.push(
        `Service Structure (Modular Facade Pattern): Service '${relPath}' missing 'index.ts'. ` +
        `Each service must have a Facade index.ts that exports typed methods.`
      );
    }

    // Check 2: Must have exactly one interface file (IServiceNameService.ts)
    if (interfaceFiles.length === 0) {
      violations.push(
        `Service Structure (Modular Facade Pattern): Service '${relPath}' missing interface file. ` +
        `Expected: I${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Service.ts (pure interface definition).`
      );
    } else if (interfaceFiles.length > 1) {
      violations.push(
        `Service Structure (Modular Facade Pattern): Service '${relPath}' has ${interfaceFiles.length} interface files. ` +
        `Expected exactly one: I${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Service.ts`
      );
    }

    // Check 3: Must have logic folder for implementation
    if (!logicFolder) {
      violations.push(
        `Service Structure (Modular Facade Pattern): Service '${relPath}' missing 'logic' folder. ` +
        `All implementation logic must be in a './logic/' subfolder.`
      );
    }
    // Check 3.5: Must have README.md with documentation (min 50 characters)
    const hasReadme = files.includes('README.md');
    if (!hasReadme) {
      violations.push(
        `Service Documentation: Service '${relPath}' missing 'README.md'. ` +
        `Each service must have a README.md file (minimum 50 characters) describing its purpose and responsibilities.`
      );
    } else {
      // Check that README.md has meaningful content (at least 50 characters)
      const readmePath = path.join(servicePath, 'README.md');
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      if (readmeContent.trim().length < 50) {
        violations.push(
          `Service Documentation: Service '${relPath}/README.md' is too short (${readmeContent.trim().length} characters). ` +
          `README.md must be at least 50 characters and describe the service's purpose and key responsibilities.`
        );
      }
    }
    // Check 4: No implementation files in main folder
    if (otherFiles.length > 0) {
      const invalidFiles = otherFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
      if (invalidFiles.length > 0) {
        violations.push(
          `Service Structure (Modular Facade Pattern): Service '${relPath}' has implementation files in main folder: [${invalidFiles.join(', ')}]. ` +
          `Only 'index.ts' and 'I*Service.ts' interface files are allowed in main folder. Implementation must be in './logic/' subfolder.`
        );
      }
    }

    // Check 5: Validate index.ts (should only import and export façade object)
    if (hasIndexTs) {
      const indexPath = path.join(servicePath, 'index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf8');

      // Count top-level export const/type/interface statements
      const exportConstLines = (indexContent.match(/^export\s+(const|type|interface)\s+\w+/gm) || []).length;
      const exportReBraceLines = (indexContent.match(/^export\s*\{\s*\w+/gm) || []).length;

      if (exportConstLines === 0 && exportReBraceLines === 0) {
        violations.push(
          `Facade Pattern (${relPath}/index.ts): Must have at least one export. ` +
          `The facade should export a typed object and its type(s).`
        );
      }

      // Check that exported const is explicitly typed with the interface
      // Only check if there's actual implementation (non-type exports)
      if (interfaceFiles.length === 1) {
        const interfaceFileName = interfaceFiles[0];
        // Extract interface name (e.g., "ILoggerService" from "ILoggerService.ts")
        const interfaceNameMatch = interfaceFileName.match(/^(I\w+Service)\.ts$/);
        
        if (interfaceNameMatch) {
          const interfaceName = interfaceNameMatch[1];
          
          // Check if this interface is actually defined as an interface (not just types)
          const interfacePathFile = path.join(servicePath, interfaceFileName);
          const interfaceFileContent = fs.readFileSync(interfacePathFile, 'utf8');
          const hasInterfaceDefinition = new RegExp(`export\\s+interface\\s+${interfaceName}`).test(interfaceFileContent);
          
          // Only enforce type contract if we have an actual interface definition (not just type exports)
          if (hasInterfaceDefinition) {
            // Check if index.ts has a const that is typed with this interface
            // Pattern: const <name>: <InterfaceName> = { ... }
            const typedExportPattern = new RegExp(`const\\s+\\w+\\s*:\\s*${interfaceName}\\s*=`);
            
            if (!typedExportPattern.test(indexContent)) {
              violations.push(
                `Facade Type Contract (${relPath}/index.ts): Exported const must be explicitly typed with '${interfaceName}'. ` +
                `Example: const ${serviceName}Service: ${interfaceName} = { ... } ` +
                `This ensures the facade strictly conforms to its interface contract and prevents undeclared methods.`
              );
            }
          }
        }
      }
    }

    // Check 6: Validate interface file (should only contain interface/type definitions)
    if (interfaceFiles.length === 1) {
      const interfacePath = path.join(servicePath, interfaceFiles[0]);
      const interfaceContent = fs.readFileSync(interfacePath, 'utf8');

      const lines = interfaceContent.split('\n');
      const implementationIndicators = ['async', 'function', 'class', 'const ', '= ', 'if(', 'for(', 'while(', 'switch('];

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        // Skip comments and empty lines
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed === '') {
          continue;
        }

        // Skip import statements
        if (trimmed.startsWith('import')) {
          continue;
        }

        // Skip valid export statements
        if (trimmed.startsWith('export interface') || trimmed.startsWith('export type') ||
          trimmed.startsWith('interface ') || trimmed.startsWith('type ')) {
          continue;
        }

        // Check for forbidden patterns
        if (implementationIndicators.some(indicator => trimmed.includes(indicator)) &&
          !trimmed.startsWith('}') && !trimmed.startsWith('[')) {
          violations.push(
            `Service Interface (${relPath}/${interfaceFiles[0]}): Found code implementation at line ${i + 1}. ` +
            `Interface files must only have 'export interface' and 'export type' definitions, no implementation.`
          );
          break;
        }
      }
    }

    // Check 7: Validate logic folder (atomization - max 2 exports per file)
    if (logicFolder) {
      const logicPath = path.join(servicePath, 'logic');
      try {
        const isDir = fs.statSync(logicPath).isDirectory();
        if (isDir) {
          walkDir(logicPath, (file) => {
            if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

            const relFile = getRelativePath(file, projectRoot);
            const content = fs.readFileSync(file, 'utf8');

            // Count exports (max 2 per file for atomization)
            const exportCount = (content.match(/^export\s+(?:const|function|class|default)/gm) || []).length;

            if (exportCount > 2) {
              violations.push(
                `Service Atomization (${relFile}): Exports ${exportCount} items. ` +
                `Maximum 2 exports per file in logic subfolder. Keep files focused on a single responsibility.`
              );
            }
          });
        }
      } catch {
        // Logic folder doesn't exist or isn't a directory
      }
    }
  });

  return violations;
}
