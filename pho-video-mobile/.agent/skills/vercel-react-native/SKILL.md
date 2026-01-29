---
name: vercel-react-native-skills
description: Performance patterns and best practices for React Native from Vercel Labs. Covers list virtualization, animations, navigation, and UI patterns.
---

# React Native Skills (Vercel Labs)

Reference these guidelines when building React Native/Expo apps.

---

## 1. List Performance (CRITICAL)

### Use FlashList for large lists
```tsx
// ❌ Bad - FlatList for large lists
import { FlatList } from 'react-native'
<FlatList data={items} renderItem={renderItem} />

// ✅ Good - FlashList with estimatedItemSize
import { FlashList } from '@shopify/flash-list'
<FlashList 
  data={items} 
  renderItem={renderItem}
  estimatedItemSize={100}
/>
```

### Memoize list items
```tsx
// ✅ Good - Memoized item component
const ListItem = memo(({ item }) => <View>{item.title}</View>)
```

### Avoid inline objects in lists
```tsx
// ❌ Bad - Inline style recreated every render
<View style={{ padding: 10 }} />

// ✅ Good - Extracted style
const styles = StyleSheet.create({ item: { padding: 10 } })
<View style={styles.item} />
```

---

## 2. Animation (HIGH)

### Only animate GPU properties
```tsx
// ✅ Good - Animate only transform/opacity (GPU accelerated)
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
  opacity: opacity.value,
}))

// ❌ Bad - Animating layout properties (CPU)
const badStyle = useAnimatedStyle(() => ({
  width: width.value,  // Triggers layout
  height: height.value,
}))
```

### Use Gesture.Tap for press feedback
```tsx
// ✅ Good - Use Gesture for animations
const tapGesture = Gesture.Tap()
  .onStart(() => { scale.value = withSpring(0.95) })
  .onEnd(() => { scale.value = withSpring(1) })
```

---

## 3. UI Patterns (HIGH)

### Use expo-image for all images
```tsx
// ❌ Bad - RN Image (no caching)
import { Image } from 'react-native'

// ✅ Good - expo-image with caching
import { Image } from 'expo-image'
<Image source={{ uri }} contentFit="cover" transition={200} />
```

### Use Pressable over TouchableOpacity
```tsx
// ❌ Bad - TouchableOpacity
<TouchableOpacity onPress={onPress}>

// ✅ Good - Pressable with style function
<Pressable 
  onPress={onPress}
  style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
>
```

### Use StyleSheet.create or NativeWind
```tsx
// ✅ Good - StyleSheet
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 }
})

// ✅ Good - NativeWind
<View className="flex-1 p-4" />
```

---

## 4. Navigation (HIGH)

### Use native navigators
```tsx
// ✅ Good - Native stack (60fps)
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// ❌ Bad - JS stack (slower)
import { createStackNavigator } from '@react-navigation/stack'
```

---

## 5. State Management (MEDIUM)

### Minimize state subscriptions
```tsx
// ❌ Bad - Subscribe to entire store
const state = useStore()

// ✅ Good - Subscribe to slice
const count = useStore(state => state.count)
```

### Show fallback on first render
```tsx
// ✅ Good - Avoid flash from async data
const [data, setData] = useState<Data | null>(null)
if (!data) return <Skeleton />
```

---

## 6. Rendering (MEDIUM)

### Wrap text in Text components
```tsx
// ❌ Bad - Crash on Android
<View>Hello</View>

// ✅ Good
<View><Text>Hello</Text></View>
```

### Avoid falsy && for conditional rendering
```tsx
// ❌ Bad - Renders "0" on screen
{count && <Badge count={count} />}

// ✅ Good - Explicit boolean
{count > 0 && <Badge count={count} />}
// or ternary
{count ? <Badge count={count} /> : null}
```

---

## Quick Install
```bash
# FlashList for virtualized lists
npx expo install @shopify/flash-list

# expo-image for optimized images
npx expo install expo-image
```

---

## References
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)
- [React Native Performance Guide](https://reactnative.dev/docs/performance)
- [Reanimated Best Practices](https://docs.swmansion.com/react-native-reanimated/)
