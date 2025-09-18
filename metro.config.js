const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enhanced Metro configuration for Expo SDK 54
config.resolver = {
  ...config.resolver,
  // Add support for additional file extensions
  assetExts: [...config.resolver.assetExts, 'bin'],
  sourceExts: [...config.resolver.sourceExts, 'mjs', 'cjs'],
};

// Improved symbolication and error handling
config.symbolicator = {
  customizeFrame: (frame) => {
    const collapse = Boolean(
      frame.file && (
        frame.file.includes('node_modules') ||
        frame.file.includes('InternalBytecode.js') ||
        frame.file.includes('react-native/Libraries')
      )
    );
    return { collapse };
  },
};

// Enhanced transformer settings for better performance
config.transformer = {
  ...config.transformer,
  // Enable inline requires for better performance
  inlineRequires: true,
  // Improve minification
  minifierConfig: {
    ...config.transformer.minifierConfig,
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Disable problematic caching for now
config.resetCache = true;

module.exports = config;
