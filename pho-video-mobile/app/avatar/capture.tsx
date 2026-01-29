import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Camera as CameraIcon, X, Check, RefreshCw } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withSpring } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const COLORS = {
    primary: "#F0421C",
    background: "#000000",
    text: "#FFFFFF",
    textMuted: "#A3A3A3",
    border: "rgba(255,255,255,0.2)",
};

const CAPTURE_STEPS = [
    { title: "Look Front", angle: "front", required: 2 },
    { title: "Look Left 45°", angle: "left", required: 2 },
    { title: "Look Right 45°", angle: "right", required: 2 },
    { title: "Look Up 45°", angle: "up", required: 1 },
    { title: "Look Down 45°", angle: "down", required: 1 },
];

export default function AvatarCapture() {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [lastCapture, setLastCapture] = useState<string | null>(null);

    const currentStep = CAPTURE_STEPS[currentStepIndex];
    const photosInCurrentStep = capturedPhotos.filter((p, i) => {
        // Simple logic for mock purposes: first 2 are front, next 2 left, etc.
        let count = 0;
        for (let j = 0; j < currentStepIndex; j++) count += CAPTURE_STEPS[j].required;
        const start = count;
        const end = count + currentStep.required;
        return i >= start && i < end;
    }).length;

    const handleCapture = async () => {
        // Since I cannot use expo-camera directly in this environment, 
        // I'll use ImagePicker to simulate camera capture or just prompt for a photo.
        // In a real device, we'd use expo-camera.

        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Camera access is needed for avatar capture.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square for face consistency
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                const photoUri = result.assets[0].uri;
                setCapturedPhotos([...capturedPhotos, photoUri]);
                setLastCapture(photoUri);

                // Check if step is done
                const totalRequired = CAPTURE_STEPS.reduce((acc, s) => acc + s.required, 0);
                if (capturedPhotos.length + 1 >= totalRequired) {
                    // All done!
                    setTimeout(() => {
                        // Pass photos to review screen
                        router.push({
                            pathname: "/avatar/review",
                            params: { photos: JSON.stringify([...capturedPhotos, photoUri]) }
                        });
                    }, 500);
                } else {
                    // Check if current step is done
                    const nextStepInGroup = photosInCurrentStep + 1 >= currentStep.required;
                    if (nextStepInGroup) {
                        setCurrentStepIndex(currentStepIndex + 1);
                    }
                }
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to capture photo");
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.iconButton}>
                        <X size={24} color="#FFF" />
                    </Pressable>
                    <View style={styles.stepIndicator}>
                        <Text style={styles.stepText}>{currentStep.title}</Text>
                        <View style={styles.progressCounter}>
                            {Array.from({ length: currentStep.required }).map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.progressChip,
                                        i < photosInCurrentStep && styles.progressChipActive
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.cameraContainer}>
                    <View style={styles.cameraFrame}>
                        {/* Camera Preview Placeholder */}
                        <View style={styles.cameraMock}>
                            <CameraIcon size={64} color="rgba(255,255,255,0.1)" />
                        </View>

                        {/* Face Guide Overlay */}
                        <View style={styles.guideOverlay}>
                            <View style={styles.guideCircle} />
                            <Text style={styles.guidePrompt}>Position your face in the circle</Text>
                        </View>

                        {/* Flash Capture Feedback */}
                        {lastCapture && (
                            <Animated.View
                                entering={FadeIn.duration(100)}
                                exiting={FadeOut.duration(300)}
                                style={styles.flashOverlay}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.controls}>
                    <View style={styles.photoStack}>
                        {capturedPhotos.length > 0 && (
                            <View style={styles.prevPhotoContainer}>
                                <Text style={styles.photoCountText}>{capturedPhotos.length}</Text>
                            </View>
                        )}
                    </View>

                    <Pressable style={styles.captureButton} onPress={handleCapture}>
                        <View style={styles.captureInner} />
                    </Pressable>

                    <Pressable style={styles.galleryButton} onPress={() => { }}>
                        <RefreshCw size={24} color="#FFF" />
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.instructionText}>
                        Hold still and follow the instructions above
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    iconButton: { padding: 8 },
    stepIndicator: { alignItems: "center" },
    stepText: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginBottom: 8 },
    progressCounter: { flexDirection: "row", gap: 6 },
    progressChip: { width: 30, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" },
    progressChipActive: { backgroundColor: COLORS.primary },
    placeholder: { width: 40 },
    cameraContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    cameraFrame: {
        width: width - 40,
        height: width - 40,
        borderRadius: width / 2,
        overflow: "hidden",
        backgroundColor: "#111",
        borderWidth: 2,
        borderColor: COLORS.border,
        position: "relative",
    },
    cameraMock: { flex: 1, justifyContent: "center", alignItems: "center" },
    guideOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center"
    },
    guideCircle: {
        width: (width - 40) * 0.7,
        height: (width - 40) * 0.7,
        borderRadius: width,
        borderWidth: 2,
        borderColor: "rgba(240, 66, 28, 0.4)",
        borderStyle: "dashed",
    },
    guidePrompt: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
        marginTop: 20,
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#FFF" },
    controls: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: 30
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: "#FFF",
        justifyContent: "center",
        alignItems: "center"
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary
    },
    photoStack: { width: 50, height: 50 },
    prevPhotoContainer: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: "#222",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    photoCountText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
    galleryButton: { width: 50, height: 50, justifyContent: "center", alignItems: "center" },
    footer: { paddingBottom: 20, alignItems: "center" },
    instructionText: { color: COLORS.textMuted, fontSize: 14 },
});
