---
name: mobile-performance
description: Mobile performance optimization patterns for React Native apps. Covers profiling, memory, rendering, and startup time.
---

# Mobile Performance Skill

## Performance Profiling

### React DevTools Profiler
1. Open React DevTools in Flipper/Chrome
2. Click "Profiler" tab
3. Record an interaction
4. Analyze flame graphs for slow components

### Systrace (Android)
```bash
npx react-native profile-hermes
```

## Critical Metrics

| Metric | Target | Tool |
|--------|--------|------|
| TTI (Time to Interactive) | < 3s | Performance Monitor |
| FPS | 60fps | Perf Monitor |
| JS Thread | < 16ms | React DevTools |
| Memory | < 200MB | Platform tools |

## Startup Optimization

### Lazy Loading
```typescript
// ❌ Bad: Import everything upfront
import { FeatureA, FeatureB, FeatureC } from './features';

// ✅ Good: Lazy load screens
const FeatureScreen = React.lazy(() => import('./FeatureScreen'));
```

### Reduce Bundle Size
```bash
# Analyze bundle
npx react-native-bundle-visualizer

# Check JS bundle size
npx expo export --dump-sourcemap
```

## Rendering Optimization

### Avoid Unnecessary Re-renders
```typescript
// Use memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexView data={data} />;
});

// Compare props
const Component = React.memo(({ user }) => {
  return <Text>{user.name}</Text>;
}, (prev, next) => prev.user.id === next.user.id);
```

### Virtualization
```typescript
// For long lists, use FlashList
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={100}
  keyExtractor={(item) => item.id}
/>
```

## Memory Management

### Detect Leaks
```typescript
// Check for unmounted component updates
useEffect(() => {
  let isMounted = true;
  
  fetchData().then(data => {
    if (isMounted) setData(data);
  });
  
  return () => { isMounted = false; };
}, []);
```

### Image Optimization
```typescript
// Use expo-image for automatic caching
import { Image } from 'expo-image';

<Image
  source={imageUrl}
  style={styles.image}
  contentFit="cover"
  cachePolicy="memory-disk"
  recyclingKey={item.id}
/>
```

## Animation Performance

### Use Native Driver
```typescript
Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // ✅ Runs on UI thread
}).start();
```

### Use Reanimated
```typescript
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

const offset = useSharedValue(0);
const animatedStyles = useAnimatedStyle(() => ({
  transform: [{ translateX: withSpring(offset.value) }],
}));
```

## Debug Commands

```bash
# Performance monitor (simulate slow device)
# In Dev Menu: "Debug" → "Performance Monitor"

# Hermes memory usage
console.log(HermesInternal.getRuntimeProperties());
```
