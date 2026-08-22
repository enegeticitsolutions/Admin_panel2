module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    // In this monorepo, babel-preset-expo is hoisted to the repository root
    // while expo-router lives in this app. Add the preset's router transform
    // explicitly so EAS can replace EXPO_ROUTER_APP_ROOT when bundling.
    plugins: [
      require('babel-preset-expo/build/expo-router-plugin').expoRouterBabelPlugin,
      'react-native-reanimated/plugin',
    ],
  };
};
