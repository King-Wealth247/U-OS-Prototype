import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

// Mock Data - In real app, this comes from backend or shared package
export const CAMPUSES = [
    { id: 'douala', name: 'Douala', lat: 4.0511, lng: 9.7679 },
    { id: 'dschang', name: 'Dschang', lat: 5.4406, lng: 10.0694 },
    { id: 'yaounde', name: 'Yaoundé', lat: 3.8667, lng: 11.5167 },
    { id: 'maroua', name: 'Maroua', lat: 10.5928, lng: 14.3110 },
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
