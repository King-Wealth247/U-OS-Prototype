import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { api } from '../services/api';

type Campus = {
    id: string;
    name: string;
    lat: number;
    lng: number;
};

interface CampusContextType {
    currentCampus: Campus;
    campuses: Campus[];
    switchCampus: (id: string) => void;
    detectBestCampus: () => void;
    isAutoDetected: boolean;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider = ({ children }: { children: React.ReactNode }) => {
    const [campuses, setCampuses] = useState<Campus[]>([
        { id: 'douala', name: 'Douala', lat: 4.0511, lng: 9.7679 },
        { id: 'dschang', name: 'Dschang', lat: 5.4406, lng: 10.0694 },
        { id: 'yaounde', name: 'Yaoundé', lat: 3.8667, lng: 11.5167 },
        { id: 'maroua', name: 'Maroua', lat: 10.5928, lng: 14.3110 },
    ]);
    const [currentCampus, setCurrentCampus] = useState<Campus>(campuses[0]);
    const [isAutoDetected, setIsAutoDetected] = useState(true);

    useEffect(() => {
        const fetchCampuses = async () => {
            try {
                const data = await api.campuses.getAll();
                const mapped = data.map((c: any) => ({
                    id: c.id,
                    name: c.townName,
                    lat: c.centerLat,
                    lng: c.centerLng
                }));
                if (mapped.length > 0) {
                    setCampuses(mapped);
                    setCurrentCampus(mapped[0]);
                }
            } catch (error) {
                console.error('Failed to fetch campuses:', error);
            }
        };
        fetchCampuses();
    }, []);

    const switchCampus = (id: string) => {
        const found = campuses.find(c => c.id === id);
        if (found) {
            setCurrentCampus(found);
            setIsAutoDetected(false);
        }
    };

    const detectBestCampus = () => {
        setIsAutoDetected(true);
        Alert.alert("GPS Detection", "Simulating GPS fix... Found Town A");
        if (campuses.length > 0) {
            setCurrentCampus(campuses[0]);
        }
    };

    if (!currentCampus) {
        return null;
    }

    if (!currentCampus) {
        return null;
    }

    return (
        <CampusContext.Provider value={{ currentCampus, campuses, switchCampus, detectBestCampus, isAutoDetected }}>
            {children}
        </CampusContext.Provider>
    );
};

export const useCampus = () => {
    const context = useContext(CampusContext);
    if (!context) throw new Error('useCampus must be used within a CampusProvider');
    return context;
};
