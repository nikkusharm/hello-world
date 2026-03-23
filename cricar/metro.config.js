const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

config.resolver.extraNodeModules = {
  'web-streams-polyfill/ponyfill/es6': require.resolve('web-streams-polyfill/ponyfill/es6'),
};

module.exports = config;