import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { api } from '../services/api';

export function ComplaintsManagementScreen() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState([]);
    const [assignModal, setAssignModal] = useState({ visible: false, complaintId: null });

    const loadData = async () => {
        try {
            setLoading(true);
            const [complaintsData, staffData] = await Promise.all([
                api.admin.getComplaints(),
                api.admin.getStaff() // Need to add this to API if not there
            ]);
            setComplaints(complaintsData);
            setStaffList(staffData);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAssign = async (staffId) => {
        try {
            await api.admin.assignComplaint(assignModal.complaintId, staffId);
            setAssignModal({ visible: false, complaintId: null });
            loadData();
            Alert.alert('Success', 'Complaint assigned');
        } catch (error) {
            Alert.alert('Error', 'Failed to assign complaint');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.admin.updateComplaintStatus(id, status);
            loadData();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return '#EF5350';
            case 'IN_PROGRESS': return '#FFA726';
            case 'RESOLVED': return '#66BB6A';
            default: return '#999';
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
            </View>

            <Text style={styles.title}>{item.description}</Text>
            <Text style={styles.meta}>
                Date: {new Date(item.createdAt).toLocaleDateString()} • User: {item.user?.fullName}
            </Text>

            <View style={styles.assignment}>
                <Text style={styles.label}>Assigned to: </Text>
                {item.assignedTo ? (
                    <Text style={styles.staffName}>{item.assignedTo.user.fullName}</Text>
                ) : (
                    <TouchableOpacity onPress={() => setAssignModal({ visible: true, complaintId: item.id })}>
                        <Text style={styles.assignLink}>+ Assign Staff</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.actions}>
                {item.status !== 'RESOLVED' && (
                    <TouchableOpacity
                        style={styles.resolveBtn}
                        onPress={() => handleStatusUpdate(item.id, 'RESOLVED')}
                    >
                        <Text style={styles.btnText}>Mark Resolved</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={complaints}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>No complaints found</Text>}
                />
            )}

            <Modal visible={assignModal.visible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Assign to Staff</Text>
                        <FlatList
                            data={staffList}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.staffItem}
                                    onPress={() => handleAssign(item.id)}
                                >
                                    <Text style={styles.staffNameModal}>{item.user.fullName}</Text>
                                    <Text style={styles.staffRole}>{item.position}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setAssignModal({ visible: false, complaintId: null })}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 10 },
    statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5 },
    meta: { color: '#888', fontSize: 12, marginBottom: 15 },
    assignment: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 },
    label: { color: '#666', fontSize: 13 },
    staffName: { fontWeight: '600', color: '#333' },
    assignLink: { color: '#4A90E2', fontWeight: '600' },
    actions: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
    resolveBtn: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    empty: { textAlign: 'center', marginTop: 50, color: '#999' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    staffItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    staffNameModal: { fontSize: 16, fontWeight: '600' },
    staffRole: { color: '#666', fontSize: 12 },
    cancelBtn: { marginTop: 20, padding: 15, alignItems: 'center' },
    cancelText: { color: '#FF5E5E', fontWeight: 'bold' }
});
