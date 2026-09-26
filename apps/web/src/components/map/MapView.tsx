"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Place } from "@memento-mori/types";
import { MAP_OPTIONS, DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/map-style";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { PlacePreview } from "./PlacePreview";
import { MapSidebar } from "./MapSidebar";
import { SEED_PLACES } from "@/lib/seed-data";
import { useCollectionsStore } from "@/lib/store";

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

// SVG circle marker path
const CIRCLE_PATH = "M -10,-10 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0";

function makeIcon(active: boolean, visited = false): google.maps.Symbol {
  return {
    path: CIRCLE_PATH,
    fillColor: active ? "#2A1A3E" : visited ? "#0A1F0A" : "#18181F",
    fillOpacity: 1,
    strokeColor: active ? "#8B5CF6" : visited ? "#16A34A" : "#2A2A3E",
    strokeWeight: active ? 2 : visited ? 1.5 : 1,
    scale: 1.2,
    anchor: new google.maps.Point(0, 0),
  };
}

export function MapView() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyRadius, setNearbyRadius] = useState<number | null>(null);
  const [showVisitedOnly, setShowVisitedOnly] = useState(false);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const nearbyCircleRef = useRef<google.maps.Circle | null>(null);

  const { visitedPlaceIds } = useCollectionsStore();

  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const selectedPlaceRef = useRef<Place | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  const filteredPlaces = SEED_PLACES.filter((p) => {
    if (activeCategory !== "ALL" && p.category !== activeCategory) return false;
    if (showVisitedOnly && !visitedPlaceIds.includes(p.id)) return false;
    if (userLocation && nearbyRadius !== null) {
      return haversineKm(userLocation, { lat: p.lat, lng: p.lng }) <= nearbyRadius;
    }
    return true;
  });

  const handleSelectPlace = useCallback((place: Place) => {
    // Deactivate previous
    if (selectedPlaceRef.current) {
      markersRef.current.get(selectedPlaceRef.current.id)?.setIcon(makeIcon(false));
    }
    setSelectedPlace(place);
    selectedPlaceRef.current = place;
    markersRef.current.get(place.id)?.setIcon(makeIcon(true));
    setSheetOpen(false);
    mapRef.current?.panTo({ lat: place.lat, lng: place.lng });
    mapRef.current?.setZoom(8);
  }, []);

  const handleDeselect = useCallback(() => {
    if (selectedPlaceRef.current) {
      markersRef.current.get(selectedPlaceRef.current.id)?.setIcon(makeIcon(false));
    }
    setSelectedPlace(null);
    selectedPlaceRef.current = null;
  }, []);

  const handleRandomPlace = useCallback(() => {
    const pool =
      activeCategory === "ALL"
        ? SEED_PLACES
        : SEED_PLACES.filter((p) => p.category === activeCategory);
    handleSelectPlace(pool[Math.floor(Math.random() * pool.length)]);
  }, [activeCategory, handleSelectPlace]);

  const handleNearbyMe = useCallback((radius: number) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setNearbyRadius(radius);
        mapRef.current?.panTo(loc);
        mapRef.current?.setZoom(8);
      },
      () => {
        alert("Could not get your location. Please allow location access.");
      }
    );
  }, []);

  const handleClearNearby = useCallback(() => {
    setUserLocation(null);
    setNearbyRadius(null);
    userMarkerRef.current?.setMap(null);
    userMarkerRef.current = null;
    nearbyCircleRef.current?.setMap(null);
    nearbyCircleRef.current = null;
  }, []);

  // User location marker + nearby circle
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    // Remove old
    userMarkerRef.current?.setMap(null);
    userMarkerRef.current = null;
    nearbyCircleRef.current?.setMap(null);
    nearbyCircleRef.current = null;

    if (!userLocation) return;

    userMarkerRef.current = new google.maps.Marker({
      map: mapRef.current,
      position: userLocation,
      title: "Your location",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#3B82F6",
        fillOpacity: 1,
        strokeColor: "#93C5FD",
        strokeWeight: 2,
        scale: 8,
      },
      zIndex: 999,
    });

    if (nearbyRadius !== null) {
      nearbyCircleRef.current = new google.maps.Circle({
        map: mapRef.current,
        center: userLocation,
        radius: nearbyRadius * 1000, // km → m
        fillColor: "#3B82F6",
        fillOpacity: 0.06,
        strokeColor: "#3B82F6",
        strokeOpacity: 0.4,
        strokeWeight: 1,
      });
    }
  }, [mapReady, userLocation, nearbyRadius]);

  // Rebuild markers + clusterer when map ready or category changes
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !mapReady) return;

    // Clear existing
    clustererRef.current?.clearMarkers();
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    const newMarkers: google.maps.Marker[] = [];

    filteredPlaces.forEach((place) => {
      const isActive = selectedPlaceRef.current?.id === place.id;
      const isVisited = visitedPlaceIds.includes(place.id);
      const marker = new google.maps.Marker({
        map: mapRef.current!,
        position: { lat: place.lat, lng: place.lng },
        label: {
          text: isVisited ? "✓" : CATEGORY_CONFIG[place.category].emoji,
          fontSize: "16px",
        },
        icon: makeIcon(isActive, isVisited),
        title: place.name,
      });

      marker.addListener("click", () => handleSelectPlace(place));
      markersRef.current.set(place.id, marker);
      newMarkers.push(marker);
    });

    clustererRef.current = new MarkerClusterer({
      map: mapRef.current,
      markers: newMarkers,
      renderer: {
        render({ count, position }) {
          return new google.maps.Marker({
            position,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#1A1228",
              fillOpacity: 1,
              strokeColor: "#6D28D9",
              strokeWeight: 1.5,
              scale: 20,
            },
            label: {
              text: String(count),
              color: "#A78BFA",
              fontSize: "13px",
              fontWeight: "500",
            },
            zIndex: 1000,
          });
        },
      },
    });

    return () => {
      clustererRef.current?.clearMarkers();
      markersRef.current.forEach((m) => m.setMap(null));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, mapReady, activeCategory, visitedPlaceIds, showVisitedOnly, userLocation, nearbyRadius]);

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg-base">
        <p className="text-text-muted">Failed to load map.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg-base">
        <p className="font-serif text-lg text-text-muted animate-pulse">
          Summoning the map...
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative" }}>
      <MapSidebar
        places={filteredPlaces}
        selectedPlace={selectedPlace}
        activeCategory={activeCategory}
        onSelectPlace={handleSelectPlace}
        onCategoryChange={setActiveCategory}
        isOpen={sheetOpen}
        onToggle={() => setSheetOpen((o) => !o)}
        visitedPlaceIds={visitedPlaceIds}
        showVisitedOnly={showVisitedOnly}
        onToggleVisitedOnly={() => setShowVisitedOnly((v) => !v)}
        nearbyRadius={nearbyRadius}
        onNearbyMe={handleNearbyMe}
        onClearNearby={handleClearNearby}
      />

      <div style={{ flex: 1, position: "relative" }}>
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          options={MAP_OPTIONS}
          onClick={handleDeselect}
          onLoad={(map) => { mapRef.current = map; setMapReady(true); }}
        />

        <button
          onClick={handleRandomPlace}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            padding: "8px 14px",
            background: "#111118",
            border: "0.5px solid #2A2A3E",
            borderRadius: 10,
            color: "#A0A0B8",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
            zIndex: 10,
          }}
        >
          ☠️ I&apos;m feeling cursed
        </button>

        {selectedPlace && (
          <PlacePreview
            place={selectedPlace}
            onClose={handleDeselect}
            onDetails={() => {}}
          />
        )}
      </div>
    </div>
  );
}
