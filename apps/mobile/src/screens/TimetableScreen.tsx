import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../services/api';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassView } from '../components/GlassView';
import { theme } from '../theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function TimetableScreen({ navigation }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            setLoading(true);
            const data = await api.timetable.getMySchedule();
            setEvents(data);
        } catch (error) {
            console.error('Failed to load schedule', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventsForDay = (dayIndex) => {
        return events.filter(e => e.weekday === dayIndex).sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderEvent = ({ item }) => (
        <GlassView style={styles.eventCard}>
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(item.startTime)}</Text>
                <View style={styles.timeLine} />
                <Text style={styles.timeText}>{formatTime(item.endTime)}</Text>
            </View>
            <View style={[styles.detailsContainer, { borderLeftColor: getColorForCourse(item.course?.departmentSlug) }]}>
                <Text style={styles.courseCode}>{item.course?.code}</Text>
                <Text style={styles.courseTitle}>{item.course?.title}</Text>
                <View style={styles.locationRow}>
                    <Text style={styles.location}>📍 {item.room?.name || 'TBA'}</Text>
                    {item.campus && <Text style={styles.campus}>({item.campus.name})</Text>}
                </View>
            </View>
        </GlassView>
    );

    const getColorForCourse = (dept) => {
        const colors = ['#4A90E2', '#E74C3C', '#2ECC71', '#F1C40F', '#9B59B6'];
        let hash = 0;
        if (!dept) return colors[0];
        for (let i = 0; i < dept.length; i++) hash = dept.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <ScreenBackground>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Timetable</Text>
            </View>

            <View style={styles.daySelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {WEEKDAYS.map((day, index) => (
                        <TouchableOpacity
                            key={day}
                            style={[styles.dayBtn, selectedDay === index && styles.dayBtnSelected]}
                            onPress={() => setSelectedDay(index)}
                        >
                            <Text style={[styles.dayText, selectedDay === index && styles.dayTextSelected]}>
                                {day}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={getEventsForDay(selectedDay)}
                    renderItem={renderEvent}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No classes scheduled for {WEEKDAYS[selectedDay]}</Text>
                        </View>
                    }
                />
            )}
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    header: { padding: 20, paddingTop: 60, paddingBottom: 10 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: theme.colors.textPrimary },

    daySelector: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    dayBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    dayBtnSelected: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
    dayText: { fontWeight: '600', color: theme.colors.textSecondary },
    dayTextSelected: { color: theme.colors.primaryDark },

    listContent: { padding: 20 },
    eventCard: { flexDirection: 'row', marginBottom: 15, padding: 0 },

    timeContainer: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    timeText: { fontSize: 13, fontWeight: 'bold', color: theme.colors.textPrimary },
    timeLine: { width: 2, height: 10, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

    detailsContainer: { flex: 1, padding: 15, borderLeftWidth: 4, justifyContent: 'center' },
    courseCode: { fontSize: 14, fontWeight: 'bold', color: theme.colors.accent, marginBottom: 2 },
    courseTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 5 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    location: { fontSize: 13, color: theme.colors.textSecondary },
    campus: { fontSize: 12, color: theme.colors.textMuted },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: theme.colors.textMuted, fontSize: 16 }
});
