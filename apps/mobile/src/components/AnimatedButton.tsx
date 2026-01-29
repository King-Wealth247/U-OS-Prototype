import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { theme } from '../theme';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    variant = 'primary',
    loading = false
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
        opacity.value = withTiming(0.8);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
    };

    const getBackgroundColor = () => {
        if (variant === 'primary') return theme.colors.accent;
        if (variant === 'secondary') return theme.colors.secondaryAccent;
        return 'transparent';
    };

    const getTextColor = () => {
        if (variant === 'outline') return theme.colors.textPrimary;
        return theme.colors.primaryDark; // Use dark text on Gold/Blue buttons
    };

    return (
        <Animated.View style={[animatedStyle]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
                activeOpacity={1}
                style={[
                    styles.container,
                    {
                        backgroundColor: getBackgroundColor(),
                        borderColor: variant === 'outline' ? theme.colors.borderHighlight : 'transparent',
                        borderWidth: variant === 'outline' ? 1 : 0
                    },
                    style
                ]}
            >
                <Text style={[
                    styles.text,
                    { color: getTextColor() },
                    textStyle
                ]}>
                    {loading ? 'Wait...' : title}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});
