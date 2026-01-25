import React, { useRef } from "react";
import { Text, TouchableOpacity, View, ActivityIndicator, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, CheckCircle2 } from "lucide-react-native";

export type ButtonStatus = "idle" | "loading" | "success" | "failed";

interface GenerateButtonProps {
    onPress?: () => void;
    status?: ButtonStatus;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ onPress, status = "idle" }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const gradientColors = status === "success"
        ? ["#10B981", "#059669"] as const
        : status === "failed"
            ? ["#EF4444", "#991B1B"] as const
            : ["#F0421C", "#E0320C"] as const;

    return (
        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={styles.button}
                disabled={status === "loading"}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {status === "idle" && (
                        <View style={styles.content}>
                            <Sparkles size={20} color="white" style={styles.icon} />
                            <Text style={styles.text}>GENERATE VIDEO</Text>
                        </View>
                    )}

                    {status === "loading" && (
                        <View style={styles.content}>
                            <ActivityIndicator color="white" style={styles.icon} />
                            <Text style={styles.text}>DEVELOPING...</Text>
                        </View>
                    )}

                    {status === "success" && (
                        <View style={styles.content}>
                            <CheckCircle2 size={22} color="white" style={styles.icon} />
                            <Text style={styles.text}>READY!</Text>
                        </View>
                    )}

                    {status === "failed" && (
                        <View style={styles.content}>
                            <Text style={styles.text}>ERROR! RETRY?</Text>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    buttonWrapper: {
        width: "100%",
        marginBottom: 32,
    },
    button: {
        width: "100%",
        height: 56,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#F0421C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    gradient: {
        width: "100%",
        height: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginRight: 8,
    },
    text: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
        letterSpacing: 1,
    },
});
