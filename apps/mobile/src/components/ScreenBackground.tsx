import { SafeAreaView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

export const ScreenBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.primaryDark, '#002855', theme.colors.background]}
                style={StyleSheet.absoluteFill}
            />

            <LinearGradient
                colors={['rgba(74, 144, 226, 0.15)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { transform: [{ scale: 1.5 }] }]}
            />

            <SafeAreaView style={styles.content}>
                {children}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background, // Fallback
    },
    content: {
        flex: 1,
        zIndex: 1,
    }
});
