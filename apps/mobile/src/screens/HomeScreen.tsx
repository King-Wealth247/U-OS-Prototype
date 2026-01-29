import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useCampus } from '../context/CampusContext';
import { api } from '../services/api';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassView } from '../components/GlassView';
import { AnimatedButton } from '../components/AnimatedButton';
import { theme } from '../theme';

export const HomeScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const { currentCampus, isAutoDetected } = useCampus();
    const [events, setEvents] = useState<any[]>([]);
    const user = route.params?.user;
    const role = user?.role || 'GUEST';
    const isGuest = role === 'GUEST';

    useEffect(() => {
        if (role === 'CASHIER') {
            navigation.replace('Cashier', { user });
        } else if (role === 'SUPER_ADMIN') {
            navigation.replace('SuperAdmin', { user });
        }
    }, [role]);

    useEffect(() => {
        if (isGuest) {
            setEvents([]);
            return;
        }

        api.timetable.getMySchedule()
            .then(data => {
                const adapted = data.map(evt => ({
                    startTime: evt.startTime,
                    endTime: evt.endTime,
                    courseCode: evt.course?.code,
                    roomCode: evt.room?.name,
                    campusName: evt.campus?.name
                }));
                setEvents(adapted);
            })
            .catch(console.error);
    }, [isGuest]);

    const handleRestrictedAction = (action: string) => {
        if (isGuest) {
            Alert.alert(
                'Login Required',
                `You must be logged in to ${action}.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                ]
            );
            return false;
        }
        return true;
    };

    return (
        <ScreenBackground>
            <View style={styles.header}>
                <View>
                    <Text style={styles.campusName}>{currentCampus.name}</Text>
                    <Text style={styles.gpsStatus}>
                        {isAutoDetected ? '📍 GPS Active' : '📍 Manual Location'}
                        {isGuest && ' • Guest'}
                    </Text>
                </View>
                <AnimatedButton
                    title="Switch"
                    onPress={() => navigation.navigate('CampusSwitch')}
                    variant="outline"
                    style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                    textStyle={{ fontSize: 12 }}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {isGuest ? (
                    <GlassView style={styles.guestBanner}>
                        <Text style={styles.guestTitle}>👋 Welcome, Visitor</Text>
                        <Text style={styles.guestText}>
                            Explore our campus maps and facilities. Log in to access your personal schedule and services.
                        </Text>
                        <AnimatedButton
                            title="Login to Access Full Features"
                            onPress={() => navigation.navigate('Login')}
                        />
                        <AnimatedButton
                            title="🗺️ Explore Campus Map"
                            onPress={() => navigation.navigate('Map')}
                            variant="outline"
                            style={{ marginTop: 10 }}
                        />
                    </GlassView>
                ) : (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.h1}>
                                {role === 'STUDENT' ? "My Classes" : "Teaching Schedule"}
                            </Text>
                            {role === 'STUDENT' && (
                                <AnimatedButton
                                    title="+ Register"
                                    onPress={() => navigation.navigate('CourseRegistration')}
                                    variant="secondary"
                                    style={{ paddingVertical: 8, paddingHorizontal: 16 }}
                                    textStyle={{ fontSize: 13 }}
                                />
                            )}
                        </View>

                        {events.map((evt, idx) => (
                            <GlassView key={idx} style={styles.card}>
                                <View style={styles.timeBadge}>
                                    <Text style={styles.time}>
                                        {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <View style={styles.timeDivider} />
                                    <Text style={styles.time}>
                                        {new Date(evt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>

                                <View style={styles.cardContent}>
                                    <Text style={styles.course}>{evt.courseCode}</Text>
                                    <View style={styles.row}>
                                        <Text style={styles.room}>@{evt.roomCode} ({evt.campusName})</Text>
                                        <AnimatedButton
                                            title="Nav"
                                            onPress={() => navigation.navigate('Map', { target: evt.roomCode })}
                                            variant="outline"
                                            style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 }}
                                            textStyle={{ fontSize: 11 }}
                                        />
                                    </View>
                                </View>
                            </GlassView>
                        ))}
                        {events.length === 0 && (
                            <GlassView style={styles.emptyCard}>
                                <Text style={styles.emptyText}>No classes scheduled for today.</Text>
                            </GlassView>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <GlassView style={styles.bottomNav} intensity={80} gradient={false}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Map')}>
                    <Text style={styles.navIcon}>🗺️</Text>
                    <Text style={styles.navLabel}>Map</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleRestrictedAction('view timetable') && navigation.navigate('Timetable')}
                >
                    <Text style={styles.navIcon}>📅</Text>
                    <Text style={styles.navLabel}>Timetable</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleRestrictedAction('access profile') && navigation.navigate('Profile')}
                >
                    <Text style={styles.navIcon}>👤</Text>
                    <Text style={styles.navLabel}>Profile</Text>
                </TouchableOpacity>
            </GlassView>
        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center'
    },
    campusName: { fontSize: 20, fontWeight: 'bold', color: theme.colors.textPrimary },
    gpsStatus: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    h1: { fontSize: 22, fontWeight: 'bold', color: theme.colors.textPrimary },

    card: {
        flexDirection: 'row',
        padding: 0,
        marginBottom: 12,
        borderRadius: theme.borderRadius.md,
        alignItems: 'stretch'
    },
    timeBadge: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80
    },
    time: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: 'bold' },
    timeDivider: { width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 4 },

    cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
    course: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: theme.colors.accent },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    room: { fontWeight: '600', color: theme.colors.textSecondary, fontSize: 13 },

    guestBanner: { padding: 24, alignItems: 'center' },
    guestTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.accent, marginBottom: 12 },
    guestText: { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 22 },

    emptyCard: { padding: 20, alignItems: 'center' },
    emptyText: { color: theme.colors.textMuted },

    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        borderRadius: 30, // Capsule shape
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    navItem: { alignItems: 'center' },
    navIcon: { fontSize: 20, marginBottom: 2 },
    navLabel: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: '600' }
});
