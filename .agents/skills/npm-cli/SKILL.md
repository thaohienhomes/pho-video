---
name: npm-cli
description: Advanced NPM usage for conflict resolution and package management
---

# NPM CLI & Dependency Management

## The "EREOLVE" Nightmare
When you see `npm error code ERESOLVE` (Dependency Conflict):
1. **Analyze:** Look at the `Found` vs `Required` versions in the log.
2. **The "Nuclear" Option:** `npm install --legacy-peer-deps` (Bypasses peer dependency checks).
3. **The Clean Slate:** 
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

## Best Practices
- **Never** mix `yarn` and `npm`. Check for `yarn.lock` and delete it if using npm.
- **Expo & React Native:** Always prefer `npx expo install` over `npm install` for core libraries (like `react-native-reanimated`, `expo-router`).
