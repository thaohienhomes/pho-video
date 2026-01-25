import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface WatermarkProps {
    style?: ViewStyle;
}

export const Watermark: React.FC<WatermarkProps> = ({ style }) => {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.text}>
                <Text style={styles._logo}>Phở</Text>
                <Text style={styles._accent}>Video</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Avoid safe area top
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 999,
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    _logo: {
        color: '#FFFFFF',
    },
    _accent: {
        color: '#F0421C', // Electric Vermilion
    },
});
