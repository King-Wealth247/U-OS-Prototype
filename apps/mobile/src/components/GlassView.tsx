import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface GlassViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    gradient?: boolean;
}

export const GlassView: React.FC<GlassViewProps> = ({
    children,
    style,
    intensity = 20,
    gradient = true
}) => {
    return (
        <BlurView intensity={intensity} tint="dark" style={[styles.container, style]}>
            {gradient && (
                <LinearGradient
                    colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
                />
            )}
            {children}
            <LinearGradient
                colors={[theme.colors.borderHighlight, theme.colors.border]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.border, { pointerEvents: 'none' }]}
            />
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: theme.borderRadius.md,
        // Fallback for Android if Blur isn't fully supported without tweaks
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
    },
    border: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        opacity: 0.3,
        zIndex: -1, // Ensure content sits above
    }
});
