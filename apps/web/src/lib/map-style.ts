export const MAP_DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0d0d15" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d0d15" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5a5a78" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#1e1e2e" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b6b8a" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a0a0b8" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0a1a10" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111120" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#252538" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5a5a78" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#111118" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#060612" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2a2a4e" }],
  },
];

export const MAP_OPTIONS: google.maps.MapOptions = {
  styles: MAP_DARK_STYLE,
  disableDefaultUI: true,
  zoomControl: true,
  zoomControlOptions: {
    position: 9, // RIGHT_BOTTOM
  },
  gestureHandling: "greedy",
  minZoom: 2,
  maxZoom: 18,
};

export const DEFAULT_CENTER = { lat: 48.8566, lng: 10.0 };
export const DEFAULT_ZOOM = 4;
