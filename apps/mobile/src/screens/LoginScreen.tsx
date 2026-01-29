import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { api } from '../services/api';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassView } from '../components/GlassView';
import { AnimatedButton } from '../components/AnimatedButton';
import { theme } from '../theme';

export const LoginScreen = ({ navigation }: { navigation: any }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const handleLogin = async () => {
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('⚠️ Please enter both email and password');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('⚠️ Please enter a valid email address');
            return;
        }

        if (password.length < 3) {
            setError('⚠️ Password must be at least 3 characters');
            return;
        }

        setLoading(true);
        try {
            // Check for guest login bypassing full API if mock
            if (email === 'guest_test@university.edu') {
                // Guest entry logic simulation if API not running fully
                // For now, assume API works
            }

            const res = await api.auth.login(email, password);

            if (res.requiresPasswordChange) {
                setIsFirstTime(true);
            } else {
                console.log('User logged in:', res.user);
                navigation.navigate('Home', { user: res.user });
            }
        } catch (e: any) {
            if (e?.response?.status === 404) {
                setError('❌ Account not found.');
            } else if (e?.response?.status === 401) {
                setError('❌ Invalid email or password.');
            } else {
                setError('❌ Login failed. Check connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.auth.login('guest_test@university.edu', 'password');
            navigation.navigate('Home', { user: res.user });
        } catch (e) {
            setError('Guest login unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        // Stub for password change
        setIsFirstTime(false);
        navigation.navigate('Home');
    };

    if (isFirstTime) {
        return (
            <ScreenBackground>
                <View style={styles.centerContainer}>
                    <GlassView style={styles.card}>
                        <Text style={styles.title}>First Time Setup</Text>
                        <Text style={styles.subtitle}>Set your permanent password.</Text>
                        <TextInput
                            placeholder="New Password"
                            placeholderTextColor={theme.colors.textSecondary}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            style={styles.input}
                        />
                        <AnimatedButton title="Set Password & Continue" onPress={handleChangePassword} />
                    </GlassView>
                </View>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.header}>
                        <Text style={styles.emoji}>🎓</Text>
                        <Text style={styles.title}>U-OS</Text>
                        <Text style={styles.subtitle}>University Operating System</Text>
                    </View>

                    <GlassView style={styles.card}>
                        <Text style={styles.loginHeader}>Welcome Back</Text>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <TextInput
                            placeholder="Institutional Email"
                            placeholderTextColor={theme.colors.textMuted}
                            value={email}
                            onChangeText={(text) => { setEmail(text); setError(''); }}
                            style={styles.input}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor={theme.colors.textMuted}
                            secureTextEntry
                            value={password}
                            onChangeText={(text) => { setPassword(text); setError(''); }}
                            style={styles.input}
                        />

                        {loading ? (
                            <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 20 }} />
                        ) : (
                            <View style={styles.buttonGroup}>
                                <AnimatedButton title="Login" onPress={handleLogin} />
                                <AnimatedButton
                                    title="Continue as Guest"
                                    onPress={handleGuestLogin}
                                    variant="outline"
                                    style={{ marginTop: 10 }}
                                />
                            </View>
                        )}

                        <View style={styles.hintBox}>
                            <Text style={styles.hintTitle}>Credentials Hint:</Text>
                            <Text style={styles.hintText}>std_0@university.edu | staff_0@university.edu</Text>
                            <Text style={styles.hintText}>admin@university.edu | guest_test@university.edu</Text>
                            <Text style={styles.hintText}>Password: password</Text>
                        </View>
                    </GlassView>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    header: { alignItems: 'center', marginBottom: 40 },
    emoji: { fontSize: 64, marginBottom: 10 },
    title: {
        fontSize: theme.typography.h1.fontSize,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4
    },
    subtitle: {
        fontSize: theme.typography.h3.fontSize,
        color: theme.colors.textSecondary,
        marginTop: 5
    },
    card: {
        padding: 24,
        borderRadius: theme.borderRadius.lg,
    },
    loginHeader: {
        fontSize: theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 24,
        textAlign: 'center'
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
        padding: 16,
        borderRadius: theme.borderRadius.md,
        marginBottom: 16,
        fontSize: 16
    },
    buttonGroup: { marginTop: 8 },
    errorBox: {
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        borderWidth: 1,
        borderColor: theme.colors.error,
        borderRadius: theme.borderRadius.sm,
        padding: 12,
        marginBottom: 16
    },
    errorText: { color: '#ffcccb', textAlign: 'center', fontWeight: '600' },
    hintBox: {
        marginTop: 24,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: theme.borderRadius.md
    },
    hintTitle: { color: theme.colors.accent, fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    hintText: { color: theme.colors.textMuted, fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }
});
