import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../services/api';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassView } from '../components/GlassView';
import { theme } from '../theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function TimetableScreen({ navigation }) {
    const [mode, setMode] = useState<'MY' | 'SEARCH'>('MY');
    const [searchDept, setSearchDept] = useState('CE');
    const [searchLevel, setSearchLevel] = useState(200);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const DEPARTMENTS = ['CE', 'EE', 'ME', 'CV', 'SE'];
    const LEVELS = [200, 300, 400, 500];

    useEffect(() => {
        if (mode === 'MY') {
            loadSchedule();
        } else {
            handleSearch();
        }
    }, [mode]);

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

    const handleSearch = async () => {
        try {
            setLoading(true);
            const data = await api.timetable.getWeeklySchedule(searchDept, searchLevel);
            setEvents(data);
        } catch (error) {
            Alert.alert("Search Failed", "Could not fetch timetable.");
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
                <Text style={styles.headerTitle}>Timetable</Text>

                {/* Mode Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, mode === 'MY' && styles.toggleBtnActive]}
                        onPress={() => setMode('MY')}
                    >
                        <Text style={[styles.toggleText, mode === 'MY' && styles.toggleTextActive]}>My Schedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, mode === 'SEARCH' && styles.toggleBtnActive]}
                        onPress={() => setMode('SEARCH')}
                    >
                        <Text style={[styles.toggleText, mode === 'SEARCH' && styles.toggleTextActive]}>Search</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Filters */}
                {mode === 'SEARCH' && (
                    <GlassView style={styles.filterContainer} intensity={40}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                            {DEPARTMENTS.map(dept => (
                                <TouchableOpacity
                                    key={dept}
                                    style={[styles.chip, searchDept === dept && styles.chipActive]}
                                    onPress={() => { setSearchDept(dept); handleSearch(); }}
                                >
                                    <Text style={[styles.chipText, searchDept === dept && styles.chipTextActive]}>{dept}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.divider} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                            {LEVELS.map(lvl => (
                                <TouchableOpacity
                                    key={lvl}
                                    style={[styles.chip, searchLevel === lvl && styles.chipActive]}
                                    onPress={() => { setSearchLevel(lvl); handleSearch(); }}
                                >
                                    <Text style={[styles.chipText, searchLevel === lvl && styles.chipTextActive]}>Level {lvl}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                            <Text style={styles.searchButtonText}>🔍 Update Results</Text>
                        </TouchableOpacity>
                    </GlassView>
                )}
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
                            <Text style={styles.emptyText}>
                                {mode === 'MY'
                                    ? `No classes scheduled for ${WEEKDAYS[selectedDay]}`
                                    : `No ${searchDept} ${searchLevel} classes on ${WEEKDAYS[selectedDay]}`
                                }
                            </Text>
                        </View>
                    }
                />
            )}
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    header: { padding: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 15 },

    toggleContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 4, marginBottom: 15 },
    toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    toggleBtnActive: { backgroundColor: theme.colors.accent },
    toggleText: { color: theme.colors.textSecondary, fontWeight: '600' },
    toggleTextActive: { color: '#fff' },

    filterContainer: { padding: 12, borderRadius: 12, gap: 10 },
    filterScroll: { marginBottom: 8 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 8 },
    chipActive: { backgroundColor: theme.colors.primary },
    chipText: { color: theme.colors.textSecondary, fontSize: 12 },
    chipTextActive: { color: '#fff', fontWeight: 'bold' },

    searchButton: { backgroundColor: theme.colors.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
    searchButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

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

    listContent: { padding: 20, paddingBottom: 100 },
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
