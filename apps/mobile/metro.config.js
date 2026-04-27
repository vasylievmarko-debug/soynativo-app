// Metro config for Yarn workspaces monorepo.
// Without this, Metro can't resolve packages/* (shared, design-tokens) because
// it only walks node_modules from the project root, not the workspace root.

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo for changes (so editing packages/shared
//    triggers a rebuild in mobile dev).
config.watchFolders = [workspaceRoot];

// 2. Tell Metro where to resolve modules. Order matters: project's own
//    node_modules first, then workspace root's node_modules (hoisted deps).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Disable hierarchical lookup so Metro doesn't accidentally resolve a
//    parent dir's node_modules outside the workspace.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
