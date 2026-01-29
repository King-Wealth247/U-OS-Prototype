import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useCampus, CAMPUSES } from '../context/CampusContext';

export const CampusSwitchScreen = ({ navigation }: { navigation: any }) => {
    const { currentCampus, switchCampus, detectBestCampus, isAutoDetected } = useCampus();

    const handleSelect = (id: string) => {
        switchCampus(id);
        navigation.goBack();
    };

    const handleGPS = () => {
        detectBestCampus();
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Campus</Text>

            <TouchableOpacity onPress={handleGPS} style={[styles.card, styles.gpsCard]}>
                <Text style={styles.cardTitle}>📍 Use User Location (GPS)</Text>
                {isAutoDetected && <Text style={styles.activeQuery}>Active: {currentCampus.name}</Text>}
            </TouchableOpacity>

            <Text style={styles.subtitle}>Available Campuses</Text>

            <FlatList
                data={CAMPUSES}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card, currentCampus.id === item.id && !isAutoDetected ? styles.activeCard : null]}
                        onPress={() => handleSelect(item.id)}
                    >
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text>Lat: {item.lat}, Lng: {item.lng}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    subtitle: { fontSize: 18, color: '#666', marginTop: 20, marginBottom: 10 },
    card: { padding: 20, backgroundColor: 'white', marginBottom: 10, borderRadius: 8, elevation: 2 },
    activeCard: { backgroundColor: '#e6f7ff', borderColor: '#1890ff', borderWidth: 1 },
    gpsCard: { backgroundColor: '#f6ffed', borderColor: '#b7eb8f', borderWidth: 1 },
    cardTitle: { fontSize: 18, fontWeight: '600' },
    activeQuery: { color: 'green', fontWeight: 'bold', marginTop: 5 }
});
