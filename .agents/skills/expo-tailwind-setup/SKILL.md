---
name: expo-tailwind-setup
description: Tailwind CSS v4 setup for Expo with NativeWind v5
---

# Tailwind CSS for Expo (NativeWind v5)

## Installation
```bash
npx expo install tailwindcss@^4 nativewind@5.0.0-preview.2 react-native-css@0.0.0-nightly.5ce6396 @tailwindcss/postcss tailwind-merge clsx
```
*Note: Add `"resolutions": { "lightningcss": "1.30.1" }` to package.json.*

## Component Wrappers (src/tw/index.tsx)
NativeWind v5 requires wrapping components to support `className`.

```tsx
import { useCssElement } from "react-native-css";
import { View as RNView, Text as RNText } from "react-native";

export const View = (props: React.ComponentProps<typeof RNView> & { className?: string }) => {
  return useCssElement(RNView, props, { className: "style" });
};

export const Text = (props: React.ComponentProps<typeof RNText> & { className?: string }) => {
  return useCssElement(RNText, props, { className: "style" });
};
```

## Usage
Import components from your wrapper file instead of `react-native`:
```tsx
import { View, Text } from "@/src/tw";

export default function App() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl font-bold text-red-500">Hello NativeWind!</Text>
    </View>
  );
}
```
