---
name: building-native-ui
description: Complete guide for building beautiful apps with Expo Router (Styling, Navigation, Patterns)
---

# Building Native UI with Expo Router

## Core Principles
1.  **Always use `Expo Go` first.** Only create custom builds when absolutely necessary.
2.  **Routes:** All routes belong in the `app` directory. Never co-locate components there.
3.  **Responsiveness:**
    *   Use `flexbox` over `Dimensions`.
    *   Prefer `useWindowDimensions` hook.
    *   First child of a Stack screen should usually be `<ScrollView contentInsetAdjustmentBehavior="automatic" />`.

## Styling
*   **No CSS/Tailwind Support (Default):** Use inline styles or `StyleSheet`.
*   **Gap:** Prefer `gap` over margin/padding for spacing.
*   **Safe Areas:** Use `contentInsetAdjustmentBehavior="automatic"` on ScrollViews.
*   **Shadows:** Use `boxShadow` style prop (CSS-like), NOT `elevation` or `shadowColor` (Legacy).
    *   Example: `<View style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }} />`
*   **Border Radius:** Use `{ borderCurve: 'continuous' }` for smoother corners.

## Navigation Patterns
*   **Links:** Use `<Link href="/path" />` from `expo-router`.
*   **Context Menus:**
    ```tsx
    import { Link } from "expo-router";
    <Link href="/settings" asChild>
      <Link.Trigger>
        <Pressable><Card /></Pressable>
      </Link.Trigger>
      <Link.Menu>
        <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={share} />
      </Link.Menu>
    </Link>
    ```
*   **Modals:** Use `presentation: "modal"` in `Stack.Screen`.
*   **Sheets:** Use `presentation: "formSheet"` with `sheetAllowedDetents`.

## Best Practices
*   **Display:** Use `<Text selectable />` for copyable text.
*   **Inputs:** Use `headerSearchBarOptions` for search bars in Stack headers.
*   **Logic:** Never use `Platform.OS`, use `process.env.EXPO_OS`.
