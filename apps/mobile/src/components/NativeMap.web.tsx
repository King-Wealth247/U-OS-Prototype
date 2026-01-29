import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web Fallback for MapView
const MapView = React.forwardRef((props: any, ref) => {
    // Mock methods that might be called via ref
    React.useImperativeHandle(ref, () => ({
        animateToRegion: () => console.log('animateToRegion called on web'),
        fitToCoordinates: () => console.log('fitToCoordinates called on web'),
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.text}>🗺️</Text>
            <Text style={styles.text}>Map View is not available on Web</Text>
            <Text style={styles.subtext}>Please use the mobile app for live tracking.</Text>
        </View>
    );
});

export const Marker = (props: any) => null;
export const Polyline = (props: any) => null;
export const Callout = (props: any) => null;
export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8
    },
    subtext: {
        fontSize: 14,
        color: '#888'
    }
});

export default MapView;
