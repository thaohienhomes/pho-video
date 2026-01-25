---
name: expo-cli
description: Master guide for using Expo CLI (SDK 54+)
---

# Expo CLI Mastery

## Core Commands
- **Start Server:** `npx expo start --clear` (Always use --clear when in doubt)
- **Install Package:** `npx expo install [package_name]` (Ensures version compatibility)
- **Fix Dependencies:** `npx expo install --fix` (Aligns dependencies with SDK version)
- **Prebuild:** `npx expo prebuild --clean` (Regenerates android/ios folders)

## Troubleshooting SDK 54
- **React 19 Conflicts:** If you see `peer react@"^18.0.0"`, use `npm install [package] --legacy-peer-deps`.
- **Metro Cache:** `npx expo start --clear` is your best friend.
- **Doctor:** `npx expo-doctor` to sanity check the environment.
