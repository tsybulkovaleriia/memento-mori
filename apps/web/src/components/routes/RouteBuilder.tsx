"use client";

import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Polyline, Marker } from "@react-google-maps/api";
import Link from "next/link";
import {
  buildRoute,
  ALL_COUNTRIES,
  type RouteFilters,
  type GeneratedRoute,
  type Transport,
  type Budget,
  type CountryScope,
} from "@/lib/route-builder";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { MAP_OPTIONS, DEFAULT_CENTER } from "@/lib/map-style";

const TRANSPORT_OPTIONS: { value: Transport; label: string; emoji: string; hint: string }[] = [
  { value: "car", emoji: "🚗", label: "Car", hint: "up to 500 km/day, 3 stops" },
  { value: "train", emoji: "🚂", label: "Train", hint: "up to 300 km/day, 2 stops" },
  { value: "plane", emoji: "✈️", label: "Plane", hint: "any distance, 2 stops/day" },
];

const BUDGET_OPTIONS: { value: Budget; label: string; emoji: string }[] = [
  { value: "budget", emoji: "💀", label: "Budget" },
  { value: "mid", emoji: "💀💀", label: "Mid" },
  { value: "splurge", emoji: "💀💀💀", label: "Splurge" },
];

const SCOPE_OPTIONS: { value: CountryScope; label: string }[] = [
  { value: "1", label: "1 country" },
  { value: "2-3", label: "2–3 countries" },
  { value: "4+", label: "4+ countries" },
];

const DAY_COLORS = [
  "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
  "#3B82F6", "#EF4444", "#A78BFA", "#F97316",
  "#06B6D4", "#84CC16", "#E879F9", "#FB7185",
  "#34D399", "#60A5FA",
];

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function RouteBuilder() {
  const [days, setDays] = useState(5);
  const [transport, setTransport] = useState<Transport>("car");
  const [countryScope, setCountryScope] = useState<CountryScope>("2-3");
  const [budget, setBudget] = useState<Budget>("mid");
  const [startingCountry, setStartingCountry] = useState("");
  const [route, setRoute] = useState<GeneratedRoute | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [mapReady, setMapReady] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const handleGenerate = useCallback(() => {
    const filters: RouteFilters = {
      days,
      transport,
      countryScope,
      budget,
      categories: [],
      startingCountry: startingCountry || undefined,
    };
    const result = buildRoute(filters);
    setRoute(result);
    setExpandedDay(1);
  }, [days, transport, countryScope, budget, startingCountry]);

  // Build polyline paths per day
  const polylines = route
    ? route.days.map((day, i) => ({
        path: day.stops.map((s) => ({ lat: s.place.lat, lng: s.place.lng })),
        color: DAY_COLORS[i % DAY_COLORS.length],
      }))
    : [];

  const allStops = route ? route.days.flatMap((d) => d.stops) : [];

  const mapCenter =
    allStops.length > 0
      ? {
          lat: allStops.reduce((s, p) => s + p.place.lat, 0) / allStops.length,
          lng: allStops.reduce((s, p) => s + p.place.lng, 0) / allStops.length,
        }
      : DEFAULT_CENTER;

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#09090F" }}>
      {/* ── Left panel ── */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          borderRight: "0.5px solid #1E1E2E",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          background: "#111118",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 18px 14px", borderBottom: "0.5px solid #1E1E2E" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <Link href="/map" style={{ fontSize: 11, color: "#5A5A78", textDecoration: "none" }}>← Map</Link>
          </div>
          <h1 style={{ margin: 0, fontFamily: "Playfair Display, Georgia, serif", fontSize: 18, color: "#F0F0F5", fontWeight: 500 }}>
            ☽ Route Builder
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#5A5A78" }}>
            Build your haunted road trip
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: "16px 18px", flex: 1 }}>

          {/* Days */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#A0A0B8", marginBottom: 8 }}>
              <span>Days</span>
              <span style={{ color: "#A78BFA", fontFamily: "JetBrains Mono, monospace" }}>{days}</span>
            </label>
            <input
              type="range"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#8B5CF6" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3A3A56", marginTop: 2 }}>
              <span>1</span><span>7</span><span>14</span>
            </div>
          </div>

          {/* Transport */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#A0A0B8", marginBottom: 8 }}>Transport</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TRANSPORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTransport(opt.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    background: transport === opt.value ? "#1A1228" : "transparent",
                    border: `0.5px solid ${transport === opt.value ? "#6D28D9" : "#2A2A3E"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{opt.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, color: transport === opt.value ? "#A78BFA" : "#A0A0B8", fontWeight: 500 }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: "#5A5A78" }}>{opt.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Country scope */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#A0A0B8", marginBottom: 8 }}>Countries</div>
            <div style={{ display: "flex", gap: 6 }}>
              {SCOPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCountryScope(opt.value)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    background: countryScope === opt.value ? "#1A1228" : "transparent",
                    border: `0.5px solid ${countryScope === opt.value ? "#6D28D9" : "#2A2A3E"}`,
                    borderRadius: 8,
                    color: countryScope === opt.value ? "#A78BFA" : "#5A5A78",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "center",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#A0A0B8", marginBottom: 8 }}>Vibe</div>
            <div style={{ display: "flex", gap: 6 }}>
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBudget(opt.value)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    background: budget === opt.value ? "#1A1228" : "transparent",
                    border: `0.5px solid ${budget === opt.value ? "#6D28D9" : "#2A2A3E"}`,
                    borderRadius: 8,
                    color: budget === opt.value ? "#A78BFA" : "#5A5A78",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "center",
                  }}
                >
                  <div>{opt.emoji}</div>
                  <div style={{ marginTop: 2 }}>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Starting country */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "#A0A0B8", marginBottom: 8 }}>Start from (optional)</div>
            <select
              value={startingCountry}
              onChange={(e) => setStartingCountry(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "#18181F",
                border: "0.5px solid #2A2A3E",
                borderRadius: 8,
                color: startingCountry ? "#F0F0F5" : "#5A5A78",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Any country</option>
              {ALL_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, #1A1228 0%, #2D1B4E 100%)",
              border: "0.5px solid #6D28D9",
              borderRadius: 10,
              color: "#A78BFA",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
            }}
          >
            ☠️ Generate Route
          </button>
        </div>

        {/* Results summary */}
        {route && (
          <div style={{ borderTop: "0.5px solid #1E1E2E", padding: "14px 18px 8px" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { label: "Places", value: route.totalPlaces },
                { label: "Countries", value: route.totalCountries.length },
                { label: "km", value: route.totalDistance.toLocaleString() },
              ].map((stat) => (
                <div key={stat.label} style={{ flex: 1, minWidth: 60, textAlign: "center", padding: "8px 4px", background: "#18181F", border: "0.5px solid #1E1E2E", borderRadius: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#A78BFA", fontFamily: "JetBrains Mono, monospace" }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: "#5A5A78", marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Day list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {route.days.map((day, i) => (
                <div key={day.day}>
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      background: expandedDay === day.day ? "#18181F" : "transparent",
                      border: `0.5px solid ${expandedDay === day.day ? "#2A2A3E" : "transparent"}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: DAY_COLORS[i % DAY_COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#A0A0B8", fontWeight: 500, flex: 1 }}>
                      Day {day.day}
                    </span>
                    <span style={{ fontSize: 11, color: "#5A5A78" }}>
                      {day.stops.length} stop{day.stops.length !== 1 ? "s" : ""} · {day.totalDistance} km
                    </span>
                    <span style={{ fontSize: 10, color: "#3A3A56" }}>
                      {expandedDay === day.day ? "▲" : "▼"}
                    </span>
                  </button>

                  {expandedDay === day.day && (
                    <div style={{ padding: "4px 10px 8px 28px" }}>
                      {day.stops.map((stop, si) => (
                        <div key={stop.place.id} style={{ marginBottom: 8 }}>
                          {si > 0 && (
                            <div style={{ fontSize: 10, color: "#3A3A56", marginBottom: 4, paddingLeft: 2 }}>
                              ↓ {stop.distanceFromPrev} km · {formatTime(stop.travelTimeFromPrev)}
                            </div>
                          )}
                          <Link
                            href={`/place/${stop.place.id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <div style={{ padding: "6px 8px", background: "#18181F", border: "0.5px solid #1E1E2E", borderRadius: 6, cursor: "pointer" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                <span style={{ fontSize: 13 }}>{CATEGORY_CONFIG[stop.place.category].emoji}</span>
                                <span style={{ fontSize: 12, color: "#F0F0F5", fontWeight: 500, lineHeight: 1.3 }}>{stop.place.name}</span>
                              </div>
                              <div style={{ fontSize: 11, color: "#5A5A78" }}>
                                {stop.place.city ? `${stop.place.city}, ` : ""}{stop.place.country}
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Map panel ── */}
      <div style={{ flex: 1, position: "relative" }}>
        {!isLoaded ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#09090F" }}>
            <p style={{ color: "#5A5A78", fontFamily: "Playfair Display, Georgia, serif", fontSize: 16 }}>Summoning the map...</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            zoom={route ? 4 : 4}
            options={MAP_OPTIONS}
            onLoad={() => setMapReady(true)}
          >
            {mapReady && route && (
              <>
                {/* Polylines per day */}
                {polylines.map((line, i) => (
                  <Polyline
                    key={i}
                    path={line.path}
                    options={{
                      strokeColor: line.color,
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                      geodesic: true,
                    }}
                  />
                ))}

                {/* Markers */}
                {route.days.map((day, di) =>
                  day.stops.map((stop, si) => (
                    <Marker
                      key={stop.place.id}
                      position={{ lat: stop.place.lat, lng: stop.place.lng }}
                      label={{
                        text: `${di + 1}`,
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: DAY_COLORS[di % DAY_COLORS.length],
                        fillOpacity: 1,
                        strokeColor: "#09090F",
                        strokeWeight: 2,
                        scale: si === 0 ? 14 : 11,
                      }}
                      title={stop.place.name}
                    />
                  ))
                )}
              </>
            )}
          </GoogleMap>
        )}

        {/* Empty state overlay */}
        {!route && isLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "rgba(17,17,24,0.9)",
                border: "0.5px solid #2A2A3E",
                borderRadius: 16,
                padding: "28px 36px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
              <p style={{ margin: "0 0 4px", fontFamily: "Playfair Display, Georgia, serif", fontSize: 16, color: "#F0F0F5" }}>
                Configure your route
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#5A5A78" }}>
                Set filters and click Generate Route
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
