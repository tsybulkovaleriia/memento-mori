"use client";

import type { Place } from "@memento-mori/types";
import { CATEGORY_CONFIG } from "@/lib/categories";

interface PlaceListItemProps {
  place: Place;
  isActive: boolean;
  onClick: () => void;
}

export function PlaceListItem({ place, isActive, onClick }: PlaceListItemProps) {
  const cat = CATEGORY_CONFIG[place.category];

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        background: isActive ? "#18181F" : "transparent",
        border: "none",
        borderBottom: "0.5px solid #1E1E2E",
        borderLeft: isActive ? "2px solid #6D28D9" : "2px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        transition: "background 0.1s",
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{cat.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: "0 0 2px",
            fontSize: 13,
            fontWeight: 500,
            color: isActive ? "#F0F0F5" : "#C0C0D8",
            fontFamily: "Playfair Display, Georgia, serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {place.name}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "#5A5A78" }}>
          {place.city ? `${place.city}, ` : ""}
          {place.country}
        </p>
      </div>
      <span style={{ fontSize: 10, letterSpacing: 1, flexShrink: 0 }}>
        {"💀".repeat(place.spookyScore)}
      </span>
    </button>
  );
}
