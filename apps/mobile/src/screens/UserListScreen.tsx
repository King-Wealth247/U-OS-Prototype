import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { api } from '../services/api';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassView } from '../components/GlassView';
import { theme } from '../theme';

export function UserListScreen({ route, navigation }) {
    const { role, title } = route.params;
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            let data = [];
            if (role === 'LECTURER') {
                data = await api.admin.getLecturers();
            } else if (role === 'STUDENT') {
                data = await api.admin.getStudents();
            }
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        if (!text) {
            setFilteredUsers(users);
        } else {
            const lower = text.toLowerCase();
            const filtered = users.filter(u =>
                u.fullName.toLowerCase().includes(lower) ||
                u.institutionalEmail.toLowerCase().includes(lower)
            );
            setFilteredUsers(filtered);
        }
    };

    const renderItem = ({ item }) => (
        <GlassView style={styles.card}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{role === 'LECTURER' ? '👨‍🏫' : '🎓'}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.email}>{item.institutionalEmail}</Text>

                {role === 'STUDENT' && item.enrollments && item.enrollments.length > 0 && (
                    <Text style={styles.dept}>
                        📚 {item.enrollments[0].department?.name || item.enrollments[0].departmentSlug} - Lvl {item.enrollments[0].level}
                    </Text>
                )}
                {role === 'LECTURER' && item.staffMember && (
                    <Text style={styles.dept}>
                        🏢 {item.staffMember.position?.replace('_', ' ')}
                    </Text>
                )}
            </View>
        </GlassView>
    );

    return (
        <ScreenBackground>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    placeholderTextColor="#ccc"
                    value={search}
                    onChangeText={handleSearch}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
                />
            )}
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    header: { padding: 20, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: 15, padding: 5 },
    backText: { color: '#fff', fontSize: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },

    searchContainer: { paddingHorizontal: 20, marginBottom: 10 },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        borderRadius: 12,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },

    list: { padding: 20 },
    card: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 15 },
    avatar: {
        width: 50, height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 15
    },
    avatarText: { fontSize: 24 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    email: { fontSize: 13, color: '#ccc' },
    dept: { fontSize: 12, color: theme.colors.accent, marginTop: 4 },
    empty: { color: '#ccc', textAlign: 'center', marginTop: 50 }
});
