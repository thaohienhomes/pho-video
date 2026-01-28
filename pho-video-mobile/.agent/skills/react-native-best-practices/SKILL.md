---
name: react-native-best-practices
description: Performance patterns and best practices for React Native development. Covers efficient rendering, memory management, and common pitfalls.
---

# React Native Best Practices Skill

## Performance Optimization

### 1. Efficient Lists
```typescript
// ❌ Bad: Using map for long lists
{items.map(item => <ItemComponent key={item.id} {...item} />)}

// ✅ Good: Use FlashList for performance
<FlashList
  data={items}
  renderItem={({ item }) => <ItemComponent {...item} />}
  estimatedItemSize={80}
/>
```

### 2. Memoization
```typescript
// ❌ Bad: Object created on every render
<Component style={{ marginTop: 10 }} />

// ✅ Good: Memoized style
const styles = useMemo(() => ({ marginTop: 10 }), []);
<Component style={styles} />

// ✅ Good: Memoized callbacks
const handlePress = useCallback(() => {
  doSomething(item.id);
}, [item.id]);
```

### 3. Image Optimization
```typescript
// ❌ Bad: Large images, no caching
<Image source={{ uri: imageUrl }} />

// ✅ Good: Optimized with expo-image
<Image
  source={imageUrl}
  contentFit="cover"
  placeholder={blurhash}
  transition={200}
  cachePolicy="memory-disk"
/>
```

### 4. Avoid Inline Functions
```typescript
// ❌ Bad: New function every render
<Button onPress={() => handleSubmit()} />

// ✅ Good: Stable reference
<Button onPress={handleSubmit} />
```

## Memory Management

### Cleanup Effects
```typescript
useEffect(() => {
  const subscription = eventEmitter.addListener('event', handler);
  
  // ✅ Always cleanup
  return () => {
    subscription.remove();
  };
}, []);
```

### Abort Fetch Requests
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  fetch(url, { signal: controller.signal })
    .then(res => res.json())
    .then(setData);
  
  return () => controller.abort();
}, [url]);
```

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Rendering too many items | Use FlashList with proper estimatedItemSize |
| Heavy computations in render | Move to useMemo or web worker |
| Large images causing OOM | Use expo-image with caching |
| Stale closures | Add correct dependencies to hooks |
| Layout thrashing | Batch state updates with unstable_batchedUpdates |

## Debugging Performance

```bash
# Enable Hermes debugger
npx react-native start --experimental-debugger

# Profile with Flipper
# Install Flipper, connect device, use React DevTools tab
```

## Architecture Patterns

### Feature-Based Structure
```
src/
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api.ts
│   └── video/
│       ├── screens/
│       ├── components/
│       └── hooks/
└── shared/
    ├── components/
    └── utils/
```

### State Management
- **Local UI State**: `useState`
- **Complex Local**: `useReducer`  
- **Global App State**: Zustand/Jotai
- **Server State**: TanStack Query
