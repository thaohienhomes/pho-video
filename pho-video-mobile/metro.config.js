const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Sửa lỗi resolve cho @tanstack/react-query v5
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['browser', 'require', 'import'];

module.exports = withNativeWind(config, { input: "./global.css" });
