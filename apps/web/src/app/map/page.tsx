"use client";

import { MapView } from "@/components/map/MapView";

export default function MapPage() {
  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <MapView />
    </main>
  );
}
