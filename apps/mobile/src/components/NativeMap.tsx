import { Platform } from "react-native";
import React from "react";

let MapView: any;
let Marker: any;
let Polyline: any;
let Callout: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS === "web") {
  MapView = ({ children, style, initialRegion, ...props }: any) => (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <div>
        <h3>🗺️ Interactive Map</h3>
        <p>
          Campus:{" "}
          {initialRegion
            ? `${initialRegion.latitude.toFixed(3)}, ${initialRegion.longitude.toFixed(3)}`
            : "Loading..."}
        </p>
        <p style={{ fontSize: "12px", opacity: 0.7 }}>
          Web maps coming soon. Use mobile app for full experience.
        </p>
      </div>
    </div>
  );
  Marker = () => null;
  Polyline = () => null;
  Callout = () => null;
  PROVIDER_GOOGLE = "google";
} else {
  try {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
    Callout = maps.Callout;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (error) {
    console.log("[NativeMap] react-native-maps not available, using fallback");
    MapView = ({ children, style, initialRegion, ...props }: any) =>
      React.createElement(
        "View",
        {
          style: {
            ...style,
            backgroundColor: "#2a2a2a",
            justifyContent: "center",
            alignItems: "center",
          },
        },
        [
          React.createElement(
            "Text",
            {
              key: "title",
              style: { color: "#fff", fontSize: 18, marginBottom: 10 },
            },
            "🗺️ Campus Map",
          ),
          React.createElement(
            "Text",
            {
              key: "coords",
              style: { color: "#ccc", fontSize: 14 },
            },
            initialRegion
              ? `${initialRegion.latitude.toFixed(4)}, ${initialRegion.longitude.toFixed(4)}`
              : "Loading...",
          ),
          React.createElement(
            "Text",
            {
              key: "note",
              style: {
                color: "#999",
                fontSize: 12,
                marginTop: 10,
                textAlign: "center",
              },
            },
            "Install react-native-maps for full map functionality",
          ),
        ],
      );
    Marker = () => null;
    Polyline = () => null;
    Callout = () => null;
    PROVIDER_GOOGLE = "google";
  }
}

export default MapView;
export { Marker, Polyline, Callout, PROVIDER_GOOGLE };
