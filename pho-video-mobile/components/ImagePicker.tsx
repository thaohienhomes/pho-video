import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Image as ImageIcon, X, Camera, FolderOpen } from "lucide-react-native";

const COLORS = {
    primary: "#F0421C",
    background: "#0A0A0A",
    surface: "#1A1A1A",
    text: "#FFFFFF",
    textMuted: "#A3A3A3",
    textDim: "#525252",
    border: "rgba(255,255,255,0.1)",
};

interface ImagePickerComponentProps {
    onImageSelected: (base64: string | null) => void;
    selectedImage: string | null;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
    onImageSelected,
    selectedImage,
}) => {
    const [loading, setLoading] = useState(false);

    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "Please allow access to your photo library to use Image-to-Video feature."
            );
            return false;
        }
        return true;
    };

    const pickImage = async (useCamera: boolean = false) => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        setLoading(true);

        try {
            let result;
            if (useCamera) {
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraPermission.status !== "granted") {
                    Alert.alert("Permission Required", "Camera access is required.");
                    setLoading(false);
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 0.8,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets[0]) {
                // Convert to base64
                const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                    // @ts-ignore
                    encoding: FileSystem.EncodingType.Base64,
                });
                onImageSelected(`data:image/jpeg;base64,${base64}`);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const removeImage = () => {
        onImageSelected(null);
    };

    if (selectedImage) {
        return (
            <View style={styles.previewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} alt="Selected image for video generation" />
                <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                    <X size={16} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.i2vBadge}>
                    <Text style={styles.i2vText}>Image-to-Video</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Or start from an image</Text>
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.pickButton}
                    onPress={() => pickImage(false)}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <>
                            <FolderOpen size={20} color={COLORS.primary} />
                            <Text style={styles.buttonText}>Gallery</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.pickButton}
                    onPress={() => pickImage(true)}
                    disabled={loading}
                >
                    <Camera size={20} color={COLORS.primary} />
                    <Text style={styles.buttonText}>Camera</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    title: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
    },
    pickButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingVertical: 14,
        borderStyle: "dashed",
    },
    buttonText: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: "500",
    },
    previewContainer: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
    },
    previewImage: {
        width: "100%",
        height: 180,
        backgroundColor: COLORS.surface,
    },
    removeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 16,
        padding: 8,
    },
    i2vBadge: {
        position: "absolute",
        bottom: 10,
        left: 10,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    i2vText: {
        color: COLORS.text,
        fontSize: 11,
        fontWeight: "bold",
    },
});
