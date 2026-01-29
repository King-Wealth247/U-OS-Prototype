import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView } from 'react-native';
import { api } from '../services/api';

const POSITIONS = [
    'VICE_CHANCELLOR', 'DEAN', 'HOD', 'REGISTRAR', 'BURSAR',
    'LIBRARIAN', 'IT_ADMIN', 'LECTURER', 'ASSISTANT_LECTURER',
    'SECURITY', 'JANITOR', 'DRIVER'
];

export function StaffManagementScreen() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [position, setPosition] = useState('LECTURER');
    const [department, setDepartment] = useState('');
    const [salary, setSalary] = useState('');

    const loadStaff = async () => {
        try {
            setLoading(true);
            const data = await api.admin.getStaff();
            setStaff(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaff();
    }, []);

    const handleCreate = async () => {
        if (!email || !department || !salary) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            await api.admin.createStaff({
                email,
                position,
                departmentId: department,
                salary: parseFloat(salary)
            });
            setModalVisible(false);
            resetForm();
            loadStaff();
            Alert.alert('Success', 'Staff member added');
        } catch (error) {
            Alert.alert('Error', 'Failed to add staff. Ensure user exists.');
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to remove this staff member?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.admin.deleteStaff(id);
                        loadStaff();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete staff');
                    }
                }
            }
        ]);
    };

    const resetForm = () => {
        setEmail('');
        setPosition('LECTURER');
        setDepartment('');
        setSalary('');
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.name}>{item.user?.fullName}</Text>
                <View style={styles.badges}>
                    <Text style={styles.posBadge}>{item.position}</Text>
                </View>
            </View>
            <Text style={styles.detail}>📧 {item.user?.institutionalEmail}</Text>
            <Text style={styles.detail}>🏢 Dept: {item.departmentId || 'N/A'}</Text>
            <Text style={styles.detail}>💰 Salary: ${item.salary}</Text>
            <Text style={styles.meta}>Hired: {new Date(item.hireDate).toLocaleDateString()}</Text>

            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
            >
                <Text style={styles.deleteText}>Remove Staff</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addBtnText}>+ Add New Staff</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={staff}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                />
            )}

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Add Staff Member</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="User Email (must exist)"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Position:</Text>
                    <ScrollView horizontal style={styles.posScroll} showsHorizontalScrollIndicator={false}>
                        {POSITIONS.map(pos => (
                            <TouchableOpacity
                                key={pos}
                                style={[styles.posOption, position === pos && styles.posSelected]}
                                onPress={() => setPosition(pos)}
                            >
                                <Text style={[styles.posText, position === pos && styles.posTextSelected]}>
                                    {pos.replace('_', ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TextInput
                        style={styles.input}
                        placeholder="Department ID"
                        value={department}
                        onChangeText={setDepartment}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Salary"
                        value={salary}
                        onChangeText={setSalary}
                        keyboardType="numeric"
                    />

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                            <Text style={styles.saveText}>Save Staff</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    addBtn: { margin: 20, backgroundColor: '#4A90E2', padding: 15, borderRadius: 12, alignItems: 'center' },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    card: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, padding: 15, borderRadius: 12, elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    badges: { flexDirection: 'row', gap: 5 },
    posBadge: { backgroundColor: '#E0F7FA', color: '#006064', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontWeight: 'bold' },
    detail: { color: '#555', marginBottom: 5 },
    meta: { color: '#999', fontSize: 12, marginTop: 5 },

    deleteBtn: { marginTop: 15, padding: 10, backgroundColor: '#FFEBEE', borderRadius: 8, alignItems: 'center' },
    deleteText: { color: '#D32F2F', fontWeight: 'bold' },

    modalContainer: { flex: 1, padding: 30, paddingTop: 60, backgroundColor: '#fff' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
    label: { fontWeight: '600', marginBottom: 10, color: '#666' },
    posScroll: { maxHeight: 50, marginBottom: 20 },
    posOption: { marginRight: 10, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', height: 40 },
    posSelected: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
    posText: { color: '#666', fontSize: 12 },
    posTextSelected: { color: '#fff' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
    cancelBtn: { padding: 15, flex: 1, marginRight: 10, alignItems: 'center' },
    cancelText: { color: '#888', fontWeight: '600' },
    saveBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, flex: 1, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: 'bold' }
});
