import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { ScreenBackground } from '../components/ScreenBackground';

export const ProfileScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const user = route.params?.user;

    // Add a check to prevent crash if user is missing, but remove the "John Doe" fallback
    if (!user) {
        return (
            <ScreenBackground>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff' }}>User data not found. Please log in again.</Text>
                </View>
            </ScreenBackground>
        );
    }

    const [editingRecoveryEmail, setEditingRecoveryEmail] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState(user.personalEmail || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
    const [changeRequestType, setChangeRequestType] = useState<'NAME' | 'EMAIL'>('NAME');
    const [requestReason, setRequestReason] = useState('');
    const [requestNewValue, setRequestNewValue] = useState('');

    const handleSaveRecoveryEmail = () => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recoveryEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid recovery email address');
            return;
        }

        // Call API to update recovery email
        Alert.alert('Success', 'Recovery email updated successfully');
        setEditingRecoveryEmail(false);
    };

    const handleChangePassword = () => {
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        // Call API to change password
        Alert.alert('Success', 'Password changed successfully');
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleRequestChange = () => {
        if (!requestNewValue.trim() || !requestReason.trim()) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        // Submit change request to admin
        Alert.alert(
            'Request Submitted',
            `Your ${changeRequestType === 'NAME' ? 'name' : 'email'} change request has been submitted to the administrator for review.`
        );
        setShowChangeRequestModal(false);
        setRequestNewValue('');
        setRequestReason('');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>👤 My Profile</Text>
                <Text style={styles.headerSubtitle}>Manage your account settings</Text>
            </View>

            {/* Immutable Fields */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.lockedField}>
                        <Text style={styles.lockedValue}>{user.fullName}</Text>
                        <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.requestButton}
                        onPress={() => {
                            setChangeRequestType('NAME');
                            setShowChangeRequestModal(true);
                        }}>
                        <Text style={styles.requestButtonText}>Request Name Change</Text>
                    </TouchableOpacity>
                </View>

                {user.role === 'STUDENT' && (
                    <View style={styles.field}>
                        <Text style={styles.label}>School Email (Institutional)</Text>
                        <View style={styles.lockedField}>
                            <Text style={styles.lockedValue}>{user.institutionalEmail}</Text>
                            <Text style={styles.lockIcon}>🔒</Text>
                        </View>
                        <Text style={styles.helpText}>
                            Your school email cannot be changed
                        </Text>
                    </View>
                )}

                <View style={styles.field}>
                    <Text style={styles.label}>Role</Text>
                    <Text style={styles.value}>{user.role}</Text>
                </View>
            </View>

            {/* Editable Fields */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information (Editable)</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Recovery Email (Personal) ✏️</Text>
                    {editingRecoveryEmail ? (
                        <>
                            <TextInput
                                style={styles.input}
                                value={recoveryEmail}
                                onChangeText={setRecoveryEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="your.email@example.com"
                            />
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => {
                                        setRecoveryEmail(user.personalEmail);
                                        setEditingRecoveryEmail(false);
                                    }}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton]}
                                    onPress={handleSaveRecoveryEmail}>
                                    <Text style={styles.buttonTextPrimary}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.value}>{recoveryEmail}</Text>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => setEditingRecoveryEmail(true)}>
                                <Text style={styles.editButtonText}>Edit Recovery Email</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <Text style={styles.helpText}>
                        Used for password resets and important notifications
                    </Text>
                </View>
            </View>

            {/* Security */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>

                <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => setShowPasswordModal(true)}>
                    <Text style={styles.primaryActionText}>🔐 Change Password</Text>
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <View style={[styles.section, { marginBottom: 40, backgroundColor: 'transparent', padding: 0 }]}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => {
                        Alert.alert(
                            "Log Out",
                            "Are you sure you want to log out?",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Log Out",
                                    style: "destructive",
                                    onPress: async () => {
                                        const { api } = require('../services/api');
                                        await api.auth.logout();
                                        // Reset navigation to Login
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: 'Login' }],
                                        });
                                    }
                                }
                            ]
                        );
                    }}>
                    <Text style={styles.logoutButtonText}>🚪 Log Out</Text>
                </TouchableOpacity>
            </View>

            {/* Password Change Modal */}
            <Modal
                visible={showPasswordModal}
                animationType="slide"
                transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Change Password</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="New Password (min 6 characters)"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => {
                                    setShowPasswordModal(false);
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleChangePassword}>
                                <Text style={styles.buttonTextPrimary}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Change Request Modal */}
            <Modal
                visible={showChangeRequestModal}
                animationType="slide"
                transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Request {changeRequestType === 'NAME' ? 'Name' : 'Email'} Change
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            This request will be reviewed by an administrator
                        </Text>

                        <Text style={styles.label}>Current Value</Text>
                        <Text style={styles.lockedValue}>
                            {changeRequestType === 'NAME'
                                ? user.fullName
                                : user.institutionalEmail}
                        </Text>

                        <Text style={styles.label}>New Value</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={`Enter new ${changeRequestType === 'NAME' ? 'name' : 'email'}`}
                            value={requestNewValue}
                            onChangeText={setRequestNewValue}
                        />

                        <Text style={styles.label}>Reason for Change</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Explain why this change is needed..."
                            multiline
                            numberOfLines={3}
                            value={requestReason}
                            onChangeText={setRequestReason}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => {
                                    setShowChangeRequestModal(false);
                                    setRequestNewValue('');
                                    setRequestReason('');
                                }}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleRequestChange}>
                                <Text style={styles.buttonTextPrimary}>Submit Request</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#007AFF',
        padding: 24,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        marginTop: 16,
        borderRadius: 12,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    value: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 8,
    },
    lockedField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    lockedValue: {
        flex: 1,
        fontSize: 16,
        color: '#666',
    },
    lockIcon: {
        fontSize: 18,
    },
    helpText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontStyle: 'italic',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    requestButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    requestButtonText: {
        color: '#007AFF',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
    editButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    editButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    buttonTextPrimary: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    primaryAction: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    logoutButton: {
        backgroundColor: '#fee2e2',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    logoutButtonText: {
        color: '#dc2626',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
