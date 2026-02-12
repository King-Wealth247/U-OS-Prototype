import { Platform } from 'react-native';
import React from 'react';

if (Platform.OS === 'web') {
  // Web fallback components
  const WebMapView = ({ children, style, initialRegion, ...props }: any) => (
    <div style={{ 
      ...style, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#1a1a1a',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div>
        <h3>🗺️ Interactive Map</h3>
        <p>Campus: {initialRegion ? `${initialRegion.latitude.toFixed(3)}, ${initialRegion.longitude.toFixed(3)}` : 'Loading...'}</p>
        <p style={{ fontSize: '12px', opacity: 0.7 }}>Web maps coming soon. Use mobile app for full experience.</p>
      </div>
    </div>
  );
  
  const WebMarker = () => null;
  const WebPolyline = () => null;
  const WebCallout = () => null;
  
  module.exports = WebMapView;
  module.exports.Marker = WebMarker;
  module.exports.Polyline = WebPolyline;
  module.exports.Callout = WebCallout;
  module.exports.PROVIDER_GOOGLE = 'google';
} else {
  // Mobile - try to use real maps, fallback to simple view
  try {
    const MapView = require('react-native-maps').default;
    const { PROVIDER_GOOGLE, Marker, Polyline, Callout } = require('react-native-maps');
    
    module.exports = MapView;
    module.exports.Marker = Marker;
    module.exports.Polyline = Polyline;
    module.exports.Callout = Callout;
    module.exports.PROVIDER_GOOGLE = PROVIDER_GOOGLE;
  } catch (error) {
    // Fallback for mobile when react-native-maps is not available
    console.log('[NativeMap] react-native-maps not available, using fallback');
    
    const FallbackMapView = ({ children, style, initialRegion, ...props }: any) => (
      React.createElement('View', {
        style: {
          ...style,
          backgroundColor: '#2a2a2a',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }, [
        React.createElement('Text', {
          key: 'title',
          style: { color: '#fff', fontSize: 18, marginBottom: 10 }
        }, '🗺️ Campus Map'),
        React.createElement('Text', {
          key: 'coords',
          style: { color: '#ccc', fontSize: 14 }
        }, initialRegion ? `${initialRegion.latitude.toFixed(4)}, ${initialRegion.longitude.toFixed(4)}` : 'Loading...'),
        React.createElement('Text', {
          key: 'note',
          style: { color: '#999', fontSize: 12, marginTop: 10, textAlign: 'center' }
        }, 'Install react-native-maps for full map functionality')
      ])
    );
    
    const FallbackMarker = () => null;
    const FallbackPolyline = () => null;
    const FallbackCallout = () => null;
    
    module.exports = FallbackMapView;
    module.exports.Marker = FallbackMarker;
    module.exports.Polyline = FallbackPolyline;
    module.exports.Callout = FallbackCallout;
    module.exports.PROVIDER_GOOGLE = 'google';
  }
}
