import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { api } from '../services/api';

export function ProfileRequestsScreen() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await api.admin.getProfileRequests('PENDING');
            setRequests(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleApprove = async (id, type) => {
        try {
            await api.admin.approveRequest(id);
            Alert.alert('Success', `${type} change approved`);
            loadRequests();
        } catch (error) {
            Alert.alert('Error', 'Failed to approve request');
        }
    };

    const handleReject = async (id) => {
        Alert.prompt('Reject Request', 'Enter reason for rejection:', async (reason) => {
            if (!reason) return;
            try {
                await api.admin.rejectRequest(id, reason);
                Alert.alert('Success', 'Request rejected');
                loadRequests();
            } catch (error) {
                Alert.alert('Error', 'Failed to reject request');
            }
        });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.typeTag}>{item.requestType} CHANGE</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>

            <Text style={styles.user}>User: {item.user?.fullName} ({item.user?.institutionalEmail})</Text>

            <View style={styles.changeRow}>
                <View style={styles.changeBlock}>
                    <Text style={styles.label}>Old</Text>
                    <Text style={styles.value}>{item.oldValue}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                <View style={[styles.changeBlock, styles.newBlock]}>
                    <Text style={styles.label}>New</Text>
                    <Text style={styles.value}>{item.newValue}</Text>
                </View>
            </View>

            <Text style={styles.reason}>Reason: "{item.reason}"</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.rejectBtn]}
                    onPress={() => handleReject(item.id)}
                >
                    <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.approveBtn]}
                    onPress={() => handleApprove(item.id, item.requestType)}
                >
                    <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={styles.empty}>No pending requests</Text>}
                    contentContainerStyle={{ padding: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    typeTag: { backgroundColor: '#E3F2FD', color: '#1976D2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12, fontWeight: 'bold' },
    date: { color: '#888', fontSize: 12 },
    user: { fontWeight: '600', marginBottom: 15, fontSize: 15 },
    changeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 },
    changeBlock: { flex: 1 },
    newBlock: { borderLeftWidth: 2, borderLeftColor: '#4CAF50', paddingLeft: 10 },
    arrow: { paddingHorizontal: 10, fontSize: 20, color: '#999' },
    label: { fontSize: 10, color: '#999', textTransform: 'uppercase' },
    value: { fontSize: 14, color: '#333' },
    reason: { fontStyle: 'italic', color: '#666', marginBottom: 15 },
    actions: { flexDirection: 'row', gap: 10 },
    button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    approveBtn: { backgroundColor: '#4CAF50' },
    rejectBtn: { backgroundColor: '#EF5350' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    empty: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});
