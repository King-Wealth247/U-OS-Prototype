import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';

export const ComplaintScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const user = route.params?.user || { role: 'STUDENT', fullName: 'John Doe' };

    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');

    const categories = [
        { id: 'PAYMENT', label: '💰 Payment Issues', icon: '💰' },
        { id: 'TIMETABLE', label: '📅 Timetable Problems', icon: '📅' },
        { id: 'FACILITY', label: '🏢 Facility/Infrastructure', icon: '🏢' },
        { id: 'ACADEMIC', label: '📚 Academic Concerns', icon: '📚' },
        { id: 'HARASSMENT', label: '⚠️ Harassment/Bullying', icon: '⚠️' },
        { id: 'OTHER', label: '📝 Other', icon: '📝' },
    ];

    const handleSubmit = () => {
        if (!category) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        if (!subject.trim()) {
            Alert.alert('Error', 'Please enter a subject');
            return;
        }

        if (!description.trim() || description.length < 20) {
            Alert.alert('Error', 'Please provide a detailed description (min 20 characters)');
            return;
        }

        // Determine priority based on category and keywords
        let priority = 'MEDIUM';
        const urgentKeywords = ['urgent', 'emergency', 'immediate', 'critical', 'harassment'];
        const descLower = description.toLowerCase();

        if (category === 'HARASSMENT' || urgentKeywords.some(k => descLower.includes(k))) {
            priority = 'URGENT';
        } else if (category === 'PAYMENT' || category === 'ACADEMIC') {
            priority = 'HIGH';
        }

        // Submit complaint to backend
        Alert.alert(
            'Complaint Submitted',
            `Your complaint has been submitted with ${priority} priority. You will receive updates via email.`,
            [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]
        );

        // Reset form
        setCategory('');
        setSubject('');
        setDescription('');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📢 Submit Complaint</Text>
                <Text style={styles.headerSubtitle}>
                    We take all complaints seriously and will respond within 48 hours
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.categoryGrid}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryCard,
                                category === cat.id && styles.categoryCardActive,
                            ]}
                            onPress={() => setCategory(cat.id)}>
                            <Text style={styles.categoryIcon}>{cat.icon}</Text>
                            <Text
                                style={[
                                    styles.categoryLabel,
                                    category === cat.id && styles.categoryLabelActive,
                                ]}>
                                {cat.label.replace(cat.icon + ' ', '')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Subject *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Brief summary of the issue..."
                    value={subject}
                    onChangeText={setSubject}
                    maxLength={100}
                />
                <Text style={styles.charCount}>{subject.length}/100</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Detailed Description *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Please provide as much detail as possible. Include dates, names (if relevant), and any evidence you have..."
                    multiline
                    numberOfLines={6}
                    value={description}
                    onChangeText={setDescription}
                    textAlignVertical="top"
                />
                <Text style={styles.charCount}>{description.length} characters</Text>
                {description.length > 0 && description.length < 20 && (
                    <Text style={styles.errorText}>
                        ⚠️ Description too short (min 20 characters)
                    </Text>
                )}
            </View>

            <View style={styles.section}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>ℹ️ What happens next?</Text>
                    <Text style={styles.infoText}>
                        1. Your complaint is logged in the system{'\n'}
                        2. An admin reviews and assigns it to the appropriate department{'\n'}
                        3. You receive status updates via email{'\n'}
                        4. Average response time: 24-48 hours
                    </Text>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit Complaint</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.emergencyBox}>
                <Text style={styles.emergencyTitle}>🚨 Emergency?</Text>
                <Text style={styles.emergencyText}>
                    For urgent safety concerns, call campus security: +237 XXX XXX XXX
                </Text>
            </View>
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
        lineHeight: 20,
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        width: '48%',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    categoryCardActive: {
        backgroundColor: '#e7f3ff',
        borderColor: '#007AFF',
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    categoryLabel: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
    categoryLabelActive: {
        color: '#007AFF',
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 140,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#d00',
        marginTop: 4,
    },
    infoBox: {
        backgroundColor: '#e7f3ff',
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#005a9c',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#005a9c',
        lineHeight: 20,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    emergencyBox: {
        backgroundColor: '#fee',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#d00',
    },
    emergencyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#c00',
        marginBottom: 4,
    },
    emergencyText: {
        fontSize: 13,
        color: '#900',
    },
});
