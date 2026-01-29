import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

// Mock Data - In real app, this comes from backend or shared package
export const CAMPUSES = [
    { id: 'town-a', name: 'Town A', lat: 4.15, lng: 9.24 },
    { id: 'town-b', name: 'Town B', lat: 4.16, lng: 9.29 },
    { id: 'town-c', name: 'Town C', lat: 4.20, lng: 9.20 },
    { id: 'town-d', name: 'Town D', lat: 4.00, lng: 9.10 },
];

type Campus = typeof CAMPUSES[0];

interface CampusContextType {
    currentCampus: Campus;
    switchCampus: (id: string) => void;
    detectBestCampus: () => void;
    isAutoDetected: boolean;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentCampus, setCurrentCampus] = useState<Campus>(CAMPUSES[0]);
    const [isAutoDetected, setIsAutoDetected] = useState(true);

    const switchCampus = (id: string) => {
        const found = CAMPUSES.find(c => c.id === id);
        if (found) {
            setCurrentCampus(found);
            setIsAutoDetected(false);
        }
    };

    const detectBestCampus = () => {
        // Mock GPS logic
        setIsAutoDetected(true);
        // Simulate detection
        Alert.alert("GPS Detection", "Simulating GPS fix... Found Town A");
        setCurrentCampus(CAMPUSES[0]);
    };

    return (
        <CampusContext.Provider value={{ currentCampus, switchCampus, detectBestCampus, isAutoDetected }}>
            {children}
        </CampusContext.Provider>
    );
};

export const useCampus = () => {
    const context = useContext(CampusContext);
    if (!context) throw new Error('useCampus must be used within a CampusProvider');
    return context;
};
