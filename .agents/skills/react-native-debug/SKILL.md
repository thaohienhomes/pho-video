---
name: react-native-debug
description: Strategies for debugging Runtime Errors and Native crashes
---

# React Native Debugging Guide

## Log Analysis (The "Forensic" Approach)
- **Metro Logs:** Check the terminal running `npx expo start`.
- **System Logs:**
  - **Android:** `npx expo run:android` (Watch for Java stack traces in terminal).
  - **iOS:** Open Console.app on Mac (not applicable on Windows).

## Common Error Patterns
1. **"files/module-types.js":** Usually a Reanimated/Babel cache issue.
   - *Fix:* `npm start -- --reset-cache` OR `npx expo start --clear`.
2. **"Worklets mismatch":** JS version of Reanimated != Native version.
   - *Fix:* Reinstall `react-native-reanimated` or Check `include` in `babel.config.js`.
3. **"Unable to resolve module":**
   - *Fix:* Check import paths.
   - *Fix:* Check `package.json` for missing deps.
   - *Fix:* `npx expo start --clear`.

## Debugging Tools
- **Expo Go Menu:** Shake device -> Open JS Debugger.
- **React DevTools:** `npx react-devtools`.
