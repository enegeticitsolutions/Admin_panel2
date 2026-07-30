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

config.resolver.blockList = [
  /.*node_modules\/.*\/bin\/\.gradle\/.*/,
  /.*\.gradle.*/,
  /.*android\/app\/build.*/,
];

// Force Metro to always use the local React Native and React instead of hoisted ones
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native' || moduleName.startsWith('react-native/')) {
    const localRN = path.resolve(__dirname, 'node_modules', moduleName);
    return context.resolveRequest(context, localRN, platform);
  }
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    const localReact = path.resolve(__dirname, 'node_modules', moduleName);
    return context.resolveRequest(context, localReact, platform);
  }
  if (moduleName === 'react-dom' || moduleName.startsWith('react-dom/')) {
    const localReactDom = path.resolve(__dirname, 'node_modules', moduleName);
    return context.resolveRequest(context, localReactDom, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
