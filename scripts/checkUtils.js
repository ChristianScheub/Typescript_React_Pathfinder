/**
 * Shared utility functions for all pre-build checks
 */

import fs from 'fs';
import path from 'path';

/**
 * Helper function to recursively walk through directories
 */
export function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

/**
 * Get project paths
 */
export function getProjectPaths() {
  const projectRoot = process.cwd();
  const srcDir = path.join(projectRoot, 'src');
  return { projectRoot, srcDir };
}

/**
 * Format a file path for error messages
 */
export function getRelativePath(file, projectRoot) {
  return path.relative(projectRoot, file).split(path.sep).join('/');
}
