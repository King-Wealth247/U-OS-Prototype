import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { api } from '../services/api';

export function CourseRegistrationScreen({ navigation }) {
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // In a real app we'd likely get available courses by dept/level
            // For now, we simulate fetching available vs enrolled
            const available = await api.academic.getAvailableCourses('CSC', 200); // Mock params
            const enrolled = await api.academic.getEnrolledCourses();

            setCourses(available);
            setEnrolledCourses(enrolled.map(c => c.id));
        } catch (error) {
            Alert.alert('Error', 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (courseId) => {
        try {
            await api.academic.registerCourse(courseId);
            Alert.alert('Success', 'Registered for course');
            loadData(); // Refresh
        } catch (error) {
            Alert.alert('Error', 'Registration failed');
        }
    };

    const isEnrolled = (courseId) => enrolledCourses.includes(courseId);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.code}>{item.code}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.credits}>{item.credits} Credits</Text>
            </View>
            {isEnrolled(item.id) ? (
                <View style={[styles.btn, styles.enrolledBtn]}>
                    <Text style={[styles.btnText, styles.enrolledText]}>Enrolled</Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.btn, styles.registerBtn]}
                    onPress={() => handleRegister(item.id)}
                >
                    <Text style={styles.btnText}>Register</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Course Registration</Text>
                <Text style={styles.subtitle}>Select courses for this semester</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={courses}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    subtitle: { color: '#666', marginTop: 5 },

    list: { padding: 15 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 1 },
    code: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 2 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    credits: { fontSize: 12, color: '#666' },

    btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    registerBtn: { backgroundColor: '#4A90E2' },
    enrolledBtn: { backgroundColor: '#E0F7FA' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    enrolledText: { color: '#006064' }
});
