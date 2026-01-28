---
name: expo-debugging
description: Expo-specific debugging techniques for development client, EAS builds, and OTA updates.
---

# Expo Debugging Skill

## Development Debugging

### Clear Cache & Restart
```bash
# Nuclear option - clears everything
npx expo start --clear

# Just clear Metro cache
rm -rf node_modules/.cache

# Clear Watchman (if stuck)
watchman watch-del-all
```

### Expo Doctor
```bash
# Check for common issues
npx expo-doctor

# Check specific areas
npx expo-doctor --check-dependencies
npx expo-doctor --check-updates
```

## EAS Build Debugging

### Build Logs
```bash
# View build logs
eas build:view [BUILD_ID]

# Download build artifacts
eas build:download --id [BUILD_ID]
```

### Common Build Failures

| Error | Solution |
|-------|----------|
| `Provisioning profile` | `eas credentials` to regenerate |
| `Code signing` | Check Apple Developer Portal certificates |
| `Pod install failed` | Add `"legacy": true` in eas.json |
| `Gradle build failed` | Check android/build.gradle versions |

### Build Configuration
```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    }
  }
}
```

## OTA Update Debugging

### Check Update Status
```typescript
import * as Updates from 'expo-updates';

async function checkUpdates() {
  if (__DEV__) {
    console.log('Updates disabled in dev mode');
    return;
  }
  
  const update = await Updates.checkForUpdateAsync();
  console.log('Update available:', update.isAvailable);
  
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  }
}
```

### Force Publish
```bash
# Publish to specific channel
eas update --branch preview --message "Bug fix"

# Force users to update
eas update --branch production --message "Critical fix"
```

## Native Module Issues

### Check Compatibility
```bash
# List all native modules
cat package.json | jq '.dependencies | to_entries[] | select(.value | contains("native") or contains("expo-"))'

# Check if module needs dev client
npx expo install --check
```

### Rebuild Dev Client
```bash
# When native deps change
eas build --profile development --platform ios
eas build --profile development --platform android
```

## Device-Specific Debugging

### iOS
```bash
# View device logs
xcrun simctl spawn booted log stream --predicate 'process == "PhoVideo"'

# Reset simulator
xcrun simctl erase all
```

### Android
```bash
# View logcat
adb logcat *:E | grep -i react

# Clear app data
adb shell pm clear com.phovideo.app

# Reverse port for dev server
adb reverse tcp:8081 tcp:8081
```

## Environment Variables

```typescript
// app.config.ts
export default {
  extra: {
    apiUrl: process.env.API_URL ?? 'https://pho.video',
    // Debug flag
    enableLogs: process.env.ENABLE_LOGS === 'true',
  },
};

// Usage
import Constants from 'expo-constants';
const { apiUrl } = Constants.expoConfig?.extra;
```
