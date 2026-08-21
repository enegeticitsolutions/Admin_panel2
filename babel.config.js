module.exports = function (api) {
  api.cache(true);
  
  if (!process.env.EXPO_ROUTER_APP_ROOT) {
    process.env.EXPO_ROUTER_APP_ROOT = __dirname + '/apps/mobile-app/app';
  }

  return {
    presets: ['babel-preset-expo'],
  };
};
