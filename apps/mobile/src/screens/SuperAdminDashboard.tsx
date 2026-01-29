import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Image, Platform } from 'react-native';
import { api } from '../services/api';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassView } from '../components/GlassView';
import { AdminChart } from '../components/AdminChart';
import { theme } from '../theme';
import { AnimatedButton } from '../components/AnimatedButton';

export function SuperAdminDashboard({ navigation }) {
    const [stats, setStats] = useState<any>(null);
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            const [statsData, adminsData] = await Promise.all([
                api.admin.getStats(),
                api.admin.getAdmins()
            ]);
            setStats(statsData);
            setAdmins(adminsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    const handleLogout = async () => {
        await api.auth.logout();
        navigation.replace('Login');
    };

    // Mock data for charts - in real app, fetch this from API
    const enrollmentData = [
        { value: 10, label: 'Jan' },
        { value: 25, label: 'Feb' },
        { value: 45, label: 'Mar' },
        { value: 30, label: 'Apr' },
        { value: 60, label: 'May' },
        { value: 85, label: 'Jun' },
    ];

    const revenueData = [
        { value: 5000, label: 'Q1' },
        { value: 12000, label: 'Q2' },
        { value: 8500, label: 'Q3' },
        { value: 15000, label: 'Q4' },
    ];

    return (
        <ScreenBackground>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Admin Overview</Text>
                        <Text style={styles.headerSubtitle}>System Performance & Metrics</Text>
                    </View>
                    <AnimatedButton
                        title="Logout"
                        onPress={handleLogout}
                        variant="outline"
                        style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                        textStyle={{ fontSize: 12 }}
                    />
                </View>

                {loading ? (
                    <Text style={styles.loading}>Loading stats...</Text>
                ) : (
                    <>
                        {/* Key Metrics Grid */}
                        <View style={styles.statsGrid}>
                            <GlassView style={styles.card}>
                                <Text style={[styles.cardValue, { color: '#4A90E2' }]}>{stats?.totalUsers || 0}</Text>
                                <Text style={styles.cardLabel}>Users</Text>
                            </GlassView>
                            <GlassView style={styles.card}>
                                <Text style={[styles.cardValue, { color: '#F5A623' }]}>{stats?.pendingRequests || 0}</Text>
                                <Text style={styles.cardLabel}>Pending</Text>
                            </GlassView>
                            <GlassView style={styles.card}>
                                <Text style={[styles.cardValue, { color: '#FF5E5E' }]}>{stats?.activeComplaints || 0}</Text>
                                <Text style={styles.cardLabel}>Issues</Text>
                            </GlassView>
                            <GlassView style={styles.card}>
                                <Text style={[styles.cardValue, { color: '#2ECC71' }]}>{stats?.totalStaff || 0}</Text>
                                <Text style={styles.cardLabel}>Staff</Text>
                            </GlassView>
                        </View>

                        {/* Charts Section */}
                        <Text style={styles.sectionTitle}>Analytics</Text>
                        <AdminChart
                            title="Student Enrollment (6 Months)"
                            type="line"
                            data={enrollmentData}
                            color="#4A90E2"
                        />
                        <AdminChart
                            title="Revenue Overview (Quarterly)"
                            type="bar"
                            data={revenueData}
                            color="#F5A623"
                            height={150}
                        />

                        {/* Management Actions */}
                        <Text style={styles.sectionTitle}>Console Actions</Text>
                        <View style={styles.actions}>
                            <GlassView style={styles.actionRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.actionTitle}>📝 Profile Requests</Text>
                                    <Text style={styles.actionDesc}>Review {stats?.pendingRequests || 0} pending changes</Text>
                                </View>
                                <AnimatedButton title="Review" onPress={() => navigation.navigate('ProfileRequests')} style={{ minWidth: 80, paddingVertical: 8 }} textStyle={{ fontSize: 12 }} />
                            </GlassView>

                            <GlassView style={styles.actionRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.actionTitle}>📢 Complaints</Text>
                                    <Text style={styles.actionDesc}>Manage reported issues</Text>
                                </View>
                                <AnimatedButton title="Manage" onPress={() => navigation.navigate('ComplaintsManager')} style={{ minWidth: 80, paddingVertical: 8 }} textStyle={{ fontSize: 12 }} />
                            </GlassView>

                            <GlassView style={styles.actionRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.actionTitle}>👥 Staff Management</Text>
                                    <Text style={styles.actionDesc}>Faculty roles & permissions</Text>
                                </View>
                                <AnimatedButton title="Open" onPress={() => navigation.navigate('StaffManager')} style={{ minWidth: 80, paddingVertical: 8 }} textStyle={{ fontSize: 12 }} />
                            </GlassView>
                        </View>

                        <Text style={styles.sectionTitle}>Directory</Text>
                        <View style={[styles.actions, { flexDirection: 'row', paddingBottom: 10 }]}>
                            <TouchableOpacity
                                style={{ flex: 1, marginRight: 10 }}
                                onPress={() => navigation.navigate('UserList', { role: 'LECTURER', title: 'All Teachers' })}
                            >
                                <GlassView style={{ alignItems: 'center', padding: 20 }}>
                                    <Text style={{ fontSize: 30, marginBottom: 10 }}>👨‍🏫</Text>
                                    <Text style={{ fontWeight: 'bold', color: theme.colors.textPrimary }}>Teachers</Text>
                                </GlassView>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ flex: 1, marginLeft: 10 }}
                                onPress={() => navigation.navigate('UserList', { role: 'STUDENT', title: 'All Students' })}
                            >
                                <GlassView style={{ alignItems: 'center', padding: 20 }}>
                                    <Text style={{ fontSize: 30, marginBottom: 10 }}>🎓</Text>
                                    <Text style={{ fontWeight: 'bold', color: theme.colors.textPrimary }}>Students</Text>
                                </GlassView>
                            </TouchableOpacity>
                        </View>

                        {/* System Admins List */}
                        <Text style={styles.sectionTitle}>System Administrators</Text>
                        <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                            {admins.map((admin: any, idx: number) => (
                                <GlassView key={idx} style={{ marginBottom: 10, padding: 15, flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                                        <Text style={{ fontSize: 20 }}>🛡️</Text>
                                    </View>
                                    <View>
                                        <Text style={{ color: theme.colors.textPrimary, fontWeight: 'bold' }}>{admin.fullName}</Text>
                                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{admin.role.replace('_', ' ')} • {admin.campus?.townName || 'All Campuses'}</Text>
                                        <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>{admin.institutionalEmail}</Text>
                                    </View>
                                </GlassView>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: 20,
        paddingHorizontal: 20
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textPrimary },
    headerSubtitle: { fontSize: 14, color: theme.colors.textSecondary },
    loading: { textAlign: 'center', marginTop: 20, color: theme.colors.textMuted },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20
    },
    card: {
        width: '48%',
        padding: 20,
        borderRadius: 16,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardValue: { fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
    cardLabel: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 15,
        marginLeft: 20,
        marginTop: 10
    },
    actions: { paddingHorizontal: 20, gap: 15, paddingBottom: 40 },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12
    },
    actionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 4 },
    actionDesc: { color: theme.colors.textSecondary, fontSize: 13 }
});
