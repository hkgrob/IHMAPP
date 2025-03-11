
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver for node core modules
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    'timers': require.resolve('timers-browserify'),
    // Use the browser version of string_decoder directly
    'string_decoder': require.resolve('string_decoder')
  }
};

module.exports = config;
