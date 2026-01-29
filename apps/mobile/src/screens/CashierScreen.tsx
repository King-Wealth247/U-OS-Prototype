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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { api } from '../services/api';

export const CashierScreen = ({ navigation }: { navigation: any }) => {
    const [studentName, setStudentName] = useState('');
    const [personalEmail, setPersonalEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const generateReference = () => {
        const ref = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
        setPaymentReference(ref);
    };

    const handleRegister = async () => {
        // Validation
        if (!studentName.trim()) {
            Alert.alert('Error', 'Student name is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(personalEmail)) {
            Alert.alert('Error', 'Valid personal email is required');
            return;
        }

        if (!phoneNumber.trim() || phoneNumber.length < 9) {
            Alert.alert('Error', 'Valid phone number is required');
            return;
        }

        if (!amount || parseFloat(amount) < 1000) {
            Alert.alert('Error', 'Minimum payment is 1000 FCFA');
            return;
        }

        if (!paymentReference.trim()) {
            Alert.alert('Error', 'Payment reference is required');
            return;
        }

        setLoading(true);

        try {
            // Call cashier endpoint using the api service
            const data = await api.cashier.registerPayment({
                studentName,
                personalEmail,
                phoneNumber,
                amount: parseFloat(amount),
                paymentReference,
                campus: 'town-a',
            });

            if (data.success) {
                setResult(data.data);
                Alert.alert('Success', 'Student registered! Credentials sent via Email, SMS, and WhatsApp.');
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to register student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStudentName('');
        setPersonalEmail('');
        setPhoneNumber('');
        setAmount('');
        setPaymentReference('');
        setResult(null);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>💰 Cashier Portal</Text>
                    <Text style={styles.headerSubtitle}>Student Payment & Registration</Text>
                </View>

                {!result ? (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Student Information</Text>

                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., John Doe"
                                value={studentName}
                                onChangeText={setStudentName}
                            />

                            <Text style={styles.label}>Personal Email *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="student@example.com"
                                value={personalEmail}
                                onChangeText={setPersonalEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.label}>Phone Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+237671234567"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Payment Details</Text>

                            <Text style={styles.label}>Amount (FCFA) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="250000"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Payment Reference *</Text>
                            <View style={styles.referenceRow}>
                                <TextInput
                                    style={[styles.input, styles.referenceInput]}
                                    placeholder="PAY123456789"
                                    value={paymentReference}
                                    onChangeText={setPaymentReference}
                                />
                                <TouchableOpacity style={styles.generateButton} onPress={generateReference}>
                                    <Text style={styles.generateButtonText}>Generate</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoTitle}>ℹ️ What happens next?</Text>
                            <Text style={styles.infoText}>
                                1. System generates unique matricule (e.g., 2600001){'\n'}
                                2. Creates institutional email (matricule@university.edu){'\n'}
                                3. Generates temporary password from student name{'\n'}
                                4. Sends credentials via Email, SMS & WhatsApp
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.registerButton, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.registerButtonText}>Register & Send Credentials</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>✅ Registration Successful!</Text>

                        <View style={styles.resultCard}>
                            <Text style={styles.resultLabel}>School Email (Institutional)</Text>
                            <Text style={styles.resultValue}>{result.user.institutionalEmail}</Text>
                        </View>

                        <View style={styles.resultCard}>
                            <Text style={styles.resultLabel}>Matricule Number</Text>
                            <Text style={styles.resultValue}>{result.user.matricule}</Text>
                        </View>

                        <View style={styles.resultCard}>
                            <Text style={styles.resultLabel}>Temporary Password</Text>
                            <Text style={styles.resultPasswordValue}>{result.temporaryPassword}</Text>
                            <Text style={styles.resultPasswordHelp}>
                                ⚠️ Student must change this on first login
                            </Text>
                        </View>

                        <View style={styles.notificationStatus}>
                            <Text style={styles.notificationsTitle}>📬 Notifications Sent:</Text>
                            <Text style={styles.notificationItem}>
                                {result.notifications.emailSent ? '✅' : '❌'} Email
                            </Text>
                            <Text style={styles.notificationItem}>
                                {result.notifications.smsSent ? '✅' : '❌'} SMS
                            </Text>
                            <Text style={styles.notificationItem}>
                                {result.notifications.whatsappSent ? '✅' : '❌'} WhatsApp
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetButtonText}>Register Another Student</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: '#28a745',
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
        marginHorizontal: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    referenceRow: {
        flexDirection: 'row',
        gap: 8,
    },
    referenceInput: {
        flex: 1,
    },
    generateButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
    },
    generateButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: '#d4edda',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#28a745',
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#155724',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#155724',
        lineHeight: 22,
    },
    registerButton: {
        backgroundColor: '#28a745',
        padding: 18,
        marginHorizontal: 16,
        marginVertical: 24,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    resultContainer: {
        padding: 16,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#28a745',
        textAlign: 'center',
        marginBottom: 24,
    },
    resultCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    resultLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    resultValue: {
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
    },
    resultPasswordValue: {
        fontSize: 24,
        color: '#007AFF',
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    resultPasswordHelp: {
        fontSize: 12,
        color: '#ff9800',
        marginTop: 8,
    },
    notificationStatus: {
        backgroundColor: '#e7f3ff',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    notificationsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0056b3',
        marginBottom: 8,
    },
    notificationItem: {
        fontSize: 14,
        color: '#0056b3',
        marginVertical: 4,
    },
    resetButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
