const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the entire monorepo so Metro can find shared packages
config.watchFolders = [monorepoRoot];

// 2. Tell Metro where to resolve packages — local app first, then monorepo root
//    This is the official Expo monorepo approach.
//    Since sathi-app uses RN 0.81.5 and mobile-app uses RN 0.83.6 (different versions),
//    npm will NOT hoist react-native — each app keeps its own local copy.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Explicitly alias core packages to their local versions using extraNodeModules.
//    This is the CORRECT Metro API for pinning packages to absolute paths.
//    (replaces the broken resolveRequest approach which passed absolute paths as module names)
config.resolver.extraNodeModules = {
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
};

// 4. Blocklist to prevent Metro from watching Gradle/Android build directories
config.resolver.blockList = [
  /.*node_modules\/.*\/bin\/\.gradle\/.*/,
  /.*\.gradle.*/,
  /.*android\/app\/build.*/,
];

module.exports = config;
