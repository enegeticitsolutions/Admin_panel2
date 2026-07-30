const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const monorepoRoot = path.resolve(__dirname, '../..');

const config = getDefaultConfig(__dirname);

// Watch the entire monorepo so Metro can find shared packages
config.watchFolders = [monorepoRoot];

// Tell Metro where to find node_modules (local first, then root)
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force Metro to resolve react/react-native from local node_modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native' || moduleName.startsWith('react-native/')) {
    const local = path.resolve(__dirname, 'node_modules', moduleName);
    return context.resolveRequest(context, local, platform);
  }
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    const local = path.resolve(__dirname, 'node_modules', moduleName);
    return context.resolveRequest(context, local, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Add ignore patterns to blocklist for Metro file map watcher.
// This prevents Windows ENOENT watch crashes caused by active Gradle build directory tasks.
config.resolver.blockList = [
  /.*node_modules\/.*\/bin\/\.gradle\/.*/,
  /.*\.gradle.*/,
  /.*android\/app\/build.*/,
];

module.exports = config;
