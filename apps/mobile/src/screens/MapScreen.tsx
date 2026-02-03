import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
} from "../components/NativeMap";
import * as Location from "expo-location";
import { useCampus } from "../context/CampusContext";
import { theme } from "../theme";
import { GlassView } from "../components/GlassView";
import { api } from "../services/api";

const { width, height } = Dimensions.get("window");

interface MapData {
  id: string;
  name: string;
  type: "outdoor" | "indoor" | "floor_plan";
  imageUrl: string;
  lat: number;
  lng: number;
  zoomLevel: number;
}

export const MapScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const targetRoom = route.params?.target;
  const { currentCampus } = useCampus();
  const mapRef = useRef<MapView>(null);

  const [activeLayer, setActiveLayer] = useState<"outdoor" | "indoor">(
    "outdoor",
  );
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<string>("undetermined");
  const [outdoorMap, setOutdoorMap] = useState<MapData | null>(null);
  const [floorMaps, setFloorMaps] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch maps from database
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setLoading(true);
        const outdoor = await api.maps.getOutdoorMap(currentCampus.id);
        setOutdoorMap(outdoor);

        // Optionally fetch floor maps
        // const floors = await api.maps.getByCampus(currentCampus.id);
        // setFloorMaps(floors.filter(m => m.type === 'floor_plan'));
      } catch (error) {
        console.error("Failed to fetch maps:", error);
        Alert.alert("Error", "Failed to load campus maps");
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, [currentCampus.id]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Allow location access to see your position on the map.",
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    })();
  }, []);

  // Center map on Campus change
  useEffect(() => {
    if (mapRef.current && outdoorMap) {
      mapRef.current.animateToRegion(
        {
          latitude: outdoorMap.lat,
          longitude: outdoorMap.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    }
  }, [outdoorMap, currentCampus]);

  return (
    <View style={styles.container}>
      {activeLayer === "outdoor" && outdoorMap ? (
        <MapView
          ref={mapRef}
          // provider={PROVIDER_GOOGLE}  <-- Removed to allow default system map (fixes blank map in Expo Go without API Key)
          style={styles.map}
          initialRegion={{
            latitude: outdoorMap.lat,
            longitude: outdoorMap.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          customMapStyle={mapStyle} // Dark mode map style
        >
          <Marker
            coordinate={{
              latitude: outdoorMap.lat,
              longitude: outdoorMap.lng,
            }}
            title={currentCampus.name}
            description="Main Campus Center"
          />
        </MapView>
      ) : (
        <View style={styles.indoorParam}>
          <Text style={styles.indoorText}>🏢 Indoor Maps Coming Soon</Text>
          <Text style={styles.subText}>
            Floor plans for {currentCampus.name}
          </Text>
        </View>
      )}

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <GlassView style={styles.headerGlass}>
          <Text style={styles.campusName}>{currentCampus.name}</Text>
          <View style={styles.pillContainer}>
            <TouchableOpacity
              style={[
                styles.pill,
                activeLayer === "outdoor" && styles.activePill,
              ]}
              onPress={() => setActiveLayer("outdoor")}
            >
              <Text
                style={[
                  styles.pillText,
                  activeLayer === "outdoor" && styles.activePillText,
                ]}
              >
                Outdoor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pill,
                activeLayer === "indoor" && styles.activePill,
              ]}
              onPress={() => setActiveLayer("indoor")}
            >
              <Text
                style={[
                  styles.pillText,
                  activeLayer === "indoor" && styles.activePillText,
                ]}
              >
                Indoor
              </Text>
            </TouchableOpacity>
          </View>
        </GlassView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (userLocation && mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              });
            } else {
              Alert.alert("Locating...", "Still finding your GPS signal.");
            }
          }}
        >
          <Text style={{ fontSize: 24 }}>📍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#242f3e",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#746855",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#242f3e",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#263c3f",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#6b9a76",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#38414e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#212a37",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9ca5b3",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#746855",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#1f2835",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#f3d19c",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [
      {
        color: "#2f3948",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#17263c",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#515c6d",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#17263c",
      },
    ],
  },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  map: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
  },
  headerGlass: {
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  campusName: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  pillContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 25,
    padding: 4,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activePill: {
    backgroundColor: theme.colors.accent,
  },
  pillText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  activePillText: {
    color: "#fff",
  },
  controls: {
    position: "absolute",
    bottom: 100, // Moved up from 30 to clear bottom nav
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  indoorParam: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E293B",
  },
  indoorText: {
    fontSize: 24,
    color: theme.colors.textPrimary,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
