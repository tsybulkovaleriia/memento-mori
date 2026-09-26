"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MAP_DARK_STYLE } from "@/lib/map-style";

interface PlaceMiniMapProps {
  lat: number;
  lng: number;
  name: string;
}

export function PlaceMiniMap({ lat, lng, name }: PlaceMiniMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  if (!isLoaded) {
    return (
      <div
        style={{
          height: 220,
          background: "#111118",
          border: "0.5px solid #1E1E2E",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 13, color: "#5A5A78" }}>Loading map...</span>
      </div>
    );
  }

  return (
    <div
      style={{
        height: 220,
        borderRadius: 12,
        overflow: "hidden",
        border: "0.5px solid #1E1E2E",
      }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={{ lat, lng }}
        zoom={8}
        options={{
          styles: MAP_DARK_STYLE,
          disableDefaultUI: true,
          gestureHandling: "none",
          zoomControl: false,
        }}
      >
        <Marker
          position={{ lat, lng }}
          label={{ text: "📍", fontSize: "20px" }}
        />
      </GoogleMap>
    </div>
  );
}
