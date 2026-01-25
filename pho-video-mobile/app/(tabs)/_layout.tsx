import { Tabs } from "expo-router";
import { View, StyleSheet, Platform, TouchableOpacity, Dimensions } from "react-native";
import { Plus, Compass, Images, User } from "lucide-react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const COLORS = {
    primary: "#F0421C",
    background: "#0A0A0A",
    inactive: "#6B6B6B",
    white: "#FFFFFF",
};

// Tab bar dimensions
const TAB_BAR_WIDTH = width - 48; // 24px margin each side
const TAB_COUNT = 4;
const ICON_SIZE = 24;

const TabIcon = ({
    Icon,
    color,
    focused,
    isPrimary = false
}: {
    Icon: any;
    color: string;
    focused: boolean;
    isPrimary?: boolean;
}) => (
    <View style={[
        styles.tabIconWrapper,
        focused && styles.tabIconActive,
        isPrimary && styles.tabIconPrimary,
    ]}>
        <Icon
            size={isPrimary ? 22 : ICON_SIZE}
            color={isPrimary ? COLORS.white : color}
            strokeWidth={focused ? 2.5 : 1.8}
        />
    </View>
);

// Haptic feedback wrapper for tab bar buttons
const HapticTabButton = (props: any) => (
    <TouchableOpacity
        {...props}
        activeOpacity={0.7}
        style={[props.style, styles.tabButton]}
        onPress={(e) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            props.onPress?.(e);
        }}
    />
);

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.inactive,
                tabBarItemStyle: styles.tabBarItem,
                tabBarBackground: () => (
                    <BlurView
                        tint="dark"
                        intensity={90}
                        style={StyleSheet.absoluteFill}
                    />
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon Icon={Plus} color={color} focused={focused} isPrimary />
                    ),
                    tabBarButton: (props) => <HapticTabButton {...props} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon Icon={Compass} color={color} focused={focused} />
                    ),
                    tabBarButton: (props) => <HapticTabButton {...props} />,
                }}
            />
            <Tabs.Screen
                name="gallery"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon Icon={Images} color={color} focused={focused} />
                    ),
                    tabBarButton: (props) => <HapticTabButton {...props} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon Icon={User} color={color} focused={focused} />
                    ),
                    tabBarButton: (props) => <HapticTabButton {...props} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: "absolute",
        bottom: Platform.OS === "ios" ? 32 : 20,
        left: 24,
        right: 24,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(20,20,20,0.9)",
        borderTopWidth: 0,
        elevation: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 8,
        paddingBottom: 0,
    },
    tabBarItem: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
    },
    tabButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    tabIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        // Even spacing through flex layout
    },
    tabIconActive: {
        backgroundColor: "rgba(240, 66, 28, 0.15)",
    },
    tabIconPrimary: {
        backgroundColor: COLORS.primary,
        // Slightly larger for emphasis
        width: 52,
        height: 52,
        borderRadius: 26,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
});
