"use client";

import Link from "next/link";
import type { Place } from "@memento-mori/types";
import { CATEGORY_CONFIG } from "@/lib/categories";

export function NearbyPlaceCard({ place }: { place: Place }) {
  const cat = CATEGORY_CONFIG[place.category];

  return (
    <Link href={`/place/${place.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 16px",
          background: "#111118",
          border: "0.5px solid #1E1E2E",
          borderRadius: 10,
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#2A2A3E";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#1E1E2E";
        }}
      >
        <span style={{ fontSize: 24 }}>{cat.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: "0 0 2px",
              fontSize: 14,
              fontWeight: 500,
              color: "#F0F0F5",
              fontFamily: "Playfair Display, Georgia, serif",
            }}
          >
            {place.name}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#5A5A78" }}>
            {place.city ? `${place.city}, ` : ""}
            {place.country}
          </p>
        </div>
        <span style={{ fontSize: 12, letterSpacing: 1 }}>
          {"💀".repeat(place.spookyScore)}
        </span>
      </div>
    </Link>
  );
}
