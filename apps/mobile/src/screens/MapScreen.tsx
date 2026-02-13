import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Image,
  ScrollView,
  Animated,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "../components/NativeMap";
import * as Location from "expo-location";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
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
  centerLat: number;
  centerLng: number;
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
  const mapRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<"outdoor" | "indoor">(
    "outdoor",
  );
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<string>("undetermined");
  const [outdoorMap, setOutdoorMap] = useState<MapData | null>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [floors, setFloors] = useState<any[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<any>(null);
  const [floorMap, setFloorMap] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);

  // Fetch maps and buildings from database
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        console.log("[MapScreen] Fetching maps for campus:", currentCampus.id);
        setLoading(true);
        const outdoor = await api.maps.getOutdoorMap(currentCampus.id);
        console.log("[MapScreen] Outdoor map data:", outdoor);
        setOutdoorMap(outdoor);

        // Fetch buildings for the campus
        try {
          const buildingsData = await api.maps.getBuildingsByCampus(currentCampus.id);
          console.log("[MapScreen] Buildings data:", buildingsData);
          setBuildings(buildingsData || []);
        } catch (err) {
          console.log("[MapScreen] Buildings error (non-fatal):", err);
        }
      } catch (error) {
        console.error("[MapScreen] Failed to fetch maps:", error);
        Alert.alert("Error", "Failed to load campus maps");
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
    // Reset selections when campus changes
    setSelectedBuilding(null);
    setSelectedFloor(null);
    setFloors([]);
    setFloorMap(null);
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
          latitude: outdoorMap.centerLat,
          longitude: outdoorMap.centerLng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    }
  }, [outdoorMap, currentCampus]);

  // Fetch floors when building is selected
  useEffect(() => {
    if (!selectedBuilding) return;
    const fetchFloors = async () => {
      try {
        const floorsData = await api.maps.getFloorsByBuilding(selectedBuilding.id);
        setFloors(floorsData || []);
      } catch (err) {
        console.log("[MapScreen] Floors error:", err);
        setFloors([]);
      }
    };
    fetchFloors();
  }, [selectedBuilding]);

  // Fetch floor map when floor is selected
  useEffect(() => {
    if (!selectedFloor) return;
    const fetchFloorMap = async () => {
      try {
        const mapData = await api.maps.getFloorMap(selectedFloor.id);
        setFloorMap(mapData);
      } catch (err) {
        console.log("[MapScreen] Floor map error:", err);
        setFloorMap(null);
      }
    };
    fetchFloorMap();
    lastScale.current = 1;
    scale.setValue(1);
    setImageError(false);
  }, [selectedFloor]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading maps...</Text>
          <Text style={styles.subText}>Campus: {currentCampus.name}</Text>
        </View>
      ) : activeLayer === "outdoor" && outdoorMap ? (
        outdoorMap.imageUrl ? (
          // Show static map image if imageUrl is provided
          <View style={styles.mapImageContainer}>
            <Image
              source={{ uri: outdoorMap.imageUrl }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Text style={styles.mapTitle}>{outdoorMap.name}</Text>
              <Text style={styles.mapCoords}>
                {outdoorMap.centerLat.toFixed(4)}, {outdoorMap.centerLng.toFixed(4)}
              </Text>
            </View>
          </View>
        ) : (
          // Show interactive MapView if no imageUrl
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: outdoorMap.centerLat,
              longitude: outdoorMap.centerLng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            customMapStyle={mapStyle}
          >
            <Marker
              coordinate={{
                latitude: outdoorMap.centerLat,
                longitude: outdoorMap.centerLng,
              }}
              title={currentCampus.name}
              description="Main Campus Center"
            />
          </MapView>
        )
      ) : (
        <View style={styles.indoorContainer}>
          {!selectedBuilding ? (
            // Building Selection View
            buildings.length > 0 ? (
              <ScrollView style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Select a Building</Text>
                {buildings.map((building) => (
                  <TouchableOpacity
                    key={building.id}
                    style={styles.buildingCard}
                    onPress={() => setSelectedBuilding(building)}
                  >
                    <Text style={styles.buildingName}>{building.name}</Text>
                    <Text style={styles.buildingCode}>{building.shortCode}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.indoorParam}>
                <Text style={styles.indoorText}>🏢 No Buildings Available</Text>
                <Text style={styles.subText}>Buildings for {currentCampus.name}</Text>
              </View>
            )
          ) : !selectedFloor ? (
            // Floor Selection View
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setSelectedBuilding(null);
                  setFloors([]);
                }}
              >
                <Text style={styles.backButtonText}>← Back to Buildings</Text>
              </TouchableOpacity>
              {floors.length > 0 ? (
                <ScrollView style={styles.listContainer}>
                  <Text style={styles.sectionTitle}>
                    {selectedBuilding.name} - Select Floor
                  </Text>
                  {floors.map((floor) => (
                    <TouchableOpacity
                      key={floor.id}
                      style={styles.floorCard}
                      onPress={() => setSelectedFloor(floor)}
                    >
                      <Text style={styles.floorName}>
                        Floor {floor.floorNumber}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.indoorParam}>
                  <Text style={styles.indoorText}>📍 No Floors Available</Text>
                  <Text style={styles.subText}>
                    Floors for {selectedBuilding.name}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            // Floor Map View
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setSelectedFloor(null);
                  setFloorMap(null);
                }}
              >
                <Text style={styles.backButtonText}>← Back to Floors</Text>
              </TouchableOpacity>
              {floorMap ? (
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PinchGestureHandler
                      onGestureEvent={Animated.event(
                        [{ nativeEvent: { scale: scale } }],
                        { useNativeDriver: true }
                      )}
                      onHandlerStateChange={(event) => {
                        if (event.nativeEvent.oldState === State.ACTIVE) {
                          lastScale.current =
                            lastScale.current * event.nativeEvent.scale;
                          if (lastScale.current < 1) lastScale.current = 1;
                          if (lastScale.current > 4) lastScale.current = 4;
                          scale.setValue(lastScale.current);
                        }
                      }}
                    >
                      {imageError ? (
                        <View style={styles.imageErrorContainer}>
                          <Text style={styles.imageErrorEmoji}>🗺️❌</Text>
                          <Text style={styles.imageErrorText}>
                            Sorry, the map is unavailable
                          </Text>
                        </View>
                      ) : (
                        <Animated.Image
                          source={{ uri: floorMap.imageUrl }}
                          style={[styles.floorImage, { transform: [{ scale }] }]}
                          resizeMode="contain"
                          onError={() => setImageError(true)}
                        />
                      )}
                    </PinchGestureHandler>
                  </View>
                  <View style={styles.floorControls}>
                    <Text style={styles.floorLabel}>{floorMap.name}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.indoorParam}>
                  <Text style={styles.indoorText}>🗺️ Map Not Available</Text>
                  <Text style={styles.subText}>
                    Floor {selectedFloor.floorNumber} - {selectedBuilding.name}
                  </Text>
                </View>
              )}
            </View>
          )}
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
  mapImageContainer: {
    flex: 1,
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 10,
  },
  mapTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  mapCoords: {
    color: "#ccc",
    fontSize: 12,
  },
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
  indoorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  floorImage: {
    width: width - 40,
    height: height - 240,
  },
  imageErrorContainer: {
    width: width - 40,
    height: height - 240,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 10,
  },
  imageErrorEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  imageErrorText: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  floorControls: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  floorLabel: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
    marginRight: 12,
  },
  floorBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
  },
  floorBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabledBtn: {
    opacity: 0.4,
  },
  listContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 140,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  buildingCard: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  buildingName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  buildingCode: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  floorCard: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  floorName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  backButton: {
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  backButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
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
