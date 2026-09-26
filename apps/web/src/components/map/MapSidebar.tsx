"use client";

import { useState, useRef } from "react";
import type { Place } from "@memento-mori/types";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { PlaceListItem } from "./PlaceListItem";
import Link from "next/link";

const NEARBY_RADII = [25, 50, 100, 200, 500];

interface MapSidebarProps {
  places: Place[];
  selectedPlace: Place | null;
  activeCategory: string;
  onSelectPlace: (place: Place) => void;
  onCategoryChange: (category: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  visitedPlaceIds: string[];
  showVisitedOnly: boolean;
  onToggleVisitedOnly: () => void;
  nearbyRadius: number | null;
  onNearbyMe: (radius: number) => void;
  onClearNearby: () => void;
}

type SheetState = "closed" | "half" | "full";

const CATEGORIES = [
  { key: "ALL", label: "All", emoji: "🗺️" },
  ...Object.entries(CATEGORY_CONFIG).map(([key, val]) => ({
    key,
    label: val.label,
    emoji: val.emoji,
  })),
];

const SHEET_HEIGHTS: Record<SheetState, string> = {
  closed: "56px",
  half: "52vh",
  full: "92vh",
};

export function MapSidebar({
  places,
  selectedPlace,
  activeCategory,
  onSelectPlace,
  onCategoryChange,
  visitedPlaceIds,
  showVisitedOnly,
  onToggleVisitedOnly,
  nearbyRadius,
  onNearbyMe,
  onClearNearby,
}: MapSidebarProps) {
  const [search, setSearch] = useState("");
  const [sheetState, setSheetState] = useState<SheetState>("closed");
  const [nearbyPickerOpen, setNearbyPickerOpen] = useState(false);

  // Touch drag tracking
  const dragStartY = useRef<number | null>(null);
  const dragStartState = useRef<SheetState>("closed");

  const filtered = places.filter((p) => {
    if (search.trim() === "") return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      (p.city ?? "").toLowerCase().includes(q)
    );
  });

  const visitedCount = visitedPlaceIds.length;
  const visitedCountries = new Set(
    places.filter((p) => visitedPlaceIds.includes(p.id)).map((p) => p.country)
  ).size;

  const cycleSheet = () => {
    setSheetState((s) => {
      if (s === "closed") return "half";
      if (s === "half") return "full";
      return "closed";
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartState.current = sheetState;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = dragStartY.current - e.changedTouches[0].clientY;
    if (dy > 40) {
      // swipe up
      setSheetState((s) => (s === "closed" ? "half" : "full"));
    } else if (dy < -40) {
      // swipe down
      setSheetState((s) => (s === "full" ? "half" : "closed"));
    }
    dragStartY.current = null;
  };

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#111118" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "0.5px solid #1E1E2E", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: 16, color: "#F0F0F5", letterSpacing: "0.02em" }}>
            Memento Mori
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <Link href="/routes" style={{ fontSize: 11, color: "#8B5CF6", textDecoration: "none", padding: "4px 8px", border: "0.5px solid #3A2A5E", borderRadius: 6 }}>
              🗺️ Routes
            </Link>
            <Link href="/my-collections" style={{ fontSize: 11, color: "#8B5CF6", textDecoration: "none", padding: "4px 8px", border: "0.5px solid #3A2A5E", borderRadius: 6 }}>
              🗂️ Collections
            </Link>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#18181F", border: "0.5px solid #2A2A3E", borderRadius: 8, padding: "7px 10px" }}>
          <span style={{ fontSize: 13, color: "#5A5A78" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search places..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#F0F0F5", fontSize: 13, fontFamily: "inherit" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#5A5A78", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
          )}
        </div>
      </div>

      {/* Stats + action buttons */}
      <div style={{ padding: "8px 12px", borderBottom: "0.5px solid #1E1E2E", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Stats row */}
        {visitedCount > 0 && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#4ADE80" }}>
              ✓ {visitedCount} visited
            </span>
            <span style={{ fontSize: 11, color: "#5A5A78" }}>·</span>
            <span style={{ fontSize: 11, color: "#5A5A78" }}>
              {visitedCountries} {visitedCountries === 1 ? "country" : "countries"}
            </span>
          </div>
        )}

        {/* Action buttons row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {/* Visited only toggle */}
          <button
            onClick={onToggleVisitedOnly}
            style={{
              padding: "4px 10px",
              background: showVisitedOnly ? "#0A1F0A" : "transparent",
              border: `0.5px solid ${showVisitedOnly ? "#16A34A" : "#2A2A3E"}`,
              borderRadius: 20,
              color: showVisitedOnly ? "#4ADE80" : "#5A5A78",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>✓</span>
            <span>{showVisitedOnly ? "Visited only" : "Show visited"}</span>
          </button>

          {/* Nearby me */}
          {nearbyRadius !== null ? (
            <button
              onClick={onClearNearby}
              style={{
                padding: "4px 10px",
                background: "#0A1020",
                border: "0.5px solid #3B82F6",
                borderRadius: 20,
                color: "#60A5FA",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>📍</span>
              <span>{nearbyRadius} km ✕</span>
            </button>
          ) : (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNearbyPickerOpen((o) => !o)}
                style={{
                  padding: "4px 10px",
                  background: nearbyPickerOpen ? "#0A1020" : "transparent",
                  border: `0.5px solid ${nearbyPickerOpen ? "#3B82F6" : "#2A2A3E"}`,
                  borderRadius: 20,
                  color: nearbyPickerOpen ? "#60A5FA" : "#5A5A78",
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>📍</span>
                <span>Nearby me</span>
              </button>
              {nearbyPickerOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  background: "#18181F",
                  border: "0.5px solid #2A2A3E",
                  borderRadius: 8,
                  padding: 6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  zIndex: 100,
                  minWidth: 110,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                }}>
                  {NEARBY_RADII.map((r) => (
                    <button
                      key={r}
                      onClick={() => { onNearbyMe(r); setNearbyPickerOpen(false); }}
                      style={{
                        padding: "5px 10px",
                        background: "transparent",
                        border: "none",
                        borderRadius: 6,
                        color: "#A0A0B8",
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#2A2A3E")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {r} km radius
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div style={{ padding: "8px 12px", borderBottom: "0.5px solid #1E1E2E", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            style={{
              padding: "4px 10px",
              background: activeCategory === cat.key ? "#1A1228" : "transparent",
              border: `0.5px solid ${activeCategory === cat.key ? "#6D28D9" : "#2A2A3E"}`,
              borderRadius: 20,
              color: activeCategory === cat.key ? "#A78BFA" : "#5A5A78",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ padding: "6px 16px", borderBottom: "0.5px solid #1E1E2E", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "#5A5A78" }}>
          {filtered.length} place{filtered.length !== 1 ? "s" : ""}
          {search && ` for "${search}"`}
          {showVisitedOnly && " · visited only"}
          {nearbyRadius !== null && ` · within ${nearbyRadius} km`}
        </span>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#5A5A78", fontSize: 13, padding: "32px 16px" }}>No places found.</p>
        ) : (
          filtered.map((place) => (
            <PlaceListItem
              key={place.id}
              place={place}
              isActive={selectedPlace?.id === place.id}
              onClick={() => onSelectPlace(place)}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div style={{ width: 300, height: "100%", flexShrink: 0, borderRight: "0.5px solid #1E1E2E", display: "flex", flexDirection: "column", overflow: "hidden" }} className="mm-desktop-sidebar">
        {sidebarContent}
      </div>

      {/* ── Mobile bottom sheet ── */}
      <>
        {/* Backdrop when full */}
        {sheetState === "full" && (
          <div
            onClick={() => setSheetState("half")}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 19 }}
            className="mm-mobile-only"
          />
        )}

        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: SHEET_HEIGHTS[sheetState],
            background: "#111118",
            borderTop: "0.5px solid #2A2A3E",
            borderRadius: "16px 16px 0 0",
            zIndex: 20,
            transition: "height 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          className="mm-mobile-only"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <button
            onClick={cycleSheet}
            style={{ width: "100%", padding: "10px 0 6px", background: "none", border: "none", cursor: "pointer", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#3A3A56" }} />
            {sheetState === "closed" && (
              <span style={{ fontSize: 12, color: "#5A5A78", letterSpacing: "0.05em" }}>
                {filtered.length} PLACES ↑
              </span>
            )}
          </button>

          {/* Content — only visible when open */}
          {sheetState !== "closed" && (
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {sidebarContent}
            </div>
          )}
        </div>
      </>

      <style>{`
        @media (min-width: 640px) {
          .mm-desktop-sidebar { display: flex !important; }
          .mm-mobile-only { display: none !important; }
        }
        @media (max-width: 639px) {
          .mm-desktop-sidebar { display: none !important; }
          .mm-mobile-only { display: flex !important; }
        }
      `}</style>
    </>
  );
}
