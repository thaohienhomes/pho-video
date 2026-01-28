---
name: systematic-debugging
description: Methodical debugging strategies for mobile apps. Provides structured approaches to isolate issues, identify root causes, and implement fixes.
---

# Systematic Debugging Skill

## Purpose
Guide the agent through methodical debugging processes instead of trial-and-error approaches.

## The "5 Whys" Framework

When encountering a bug:

1. **State the Problem Clearly**
   - What is the expected behavior?
   - What is the actual behavior?
   - When does it occur?

2. **Reproduce Consistently**
   - Create minimal reproduction steps
   - Identify if it's deterministic or intermittent

3. **Isolate the Scope**
   - Component level? Screen level? App-wide?
   - iOS only? Android only? Both?

4. **Trace the Data Flow**
   ```
   Input → Component → State Change → Output
   ```
   - Add console.logs at each checkpoint
   - Verify data types and values at each step

5. **Root Cause Analysis**
   Ask "Why?" 5 times:
   - Why did the crash happen? → Memory leak
   - Why was there a memory leak? → Component didn't unmount properly
   - Why didn't it unmount? → useEffect cleanup was missing
   - Why was cleanup missing? → Developer forgot
   - Why? → No linting rule for cleanup

## Mobile-Specific Debug Checklist

### React Native / Expo Issues
- [ ] Check Metro bundler logs
- [ ] Check device logs (Logcat/Console.app)
- [ ] Verify native module compatibility
- [ ] Check for hot reload cache issues
- [ ] Verify Expo SDK version compatibility

### Performance Issues
- [ ] Use React DevTools Profiler
- [ ] Check for unnecessary re-renders
- [ ] Monitor memory usage
- [ ] Check image sizes and caching
- [ ] Verify FlatList/FlashList optimization

### Network Issues
- [ ] Use Flipper Network Inspector
- [ ] Check request/response payloads
- [ ] Verify API base URLs per environment
- [ ] Check for timeout settings

## Debug Commands

```bash
# Clear all caches
npx expo start --clear

# Check for dependency issues
npx expo-doctor

# View device logs (Android)
adb logcat *:E

# View device logs (iOS)
xcrun simctl spawn booted log stream | grep -i error
```

## When Stuck

1. **Binary Search**: Comment out half the code, test, narrow down
2. **Fresh Start**: `rm -rf node_modules && npm install`
3. **Compare Working State**: Use git diff against last working commit
4. **Minimal Repro**: Create new Expo project, add only affected code
