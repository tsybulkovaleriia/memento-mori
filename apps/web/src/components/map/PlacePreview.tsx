"use client";

import { useRouter } from "next/navigation";
import type { Place } from "@memento-mori/types";
import { CATEGORY_CONFIG, getSpookySkulls } from "@/lib/categories";
import { VisitedButton } from "@/components/place/VisitedButton";

interface PlacePreviewProps {
  place: Place;
  onClose: () => void;
  onDetails: (place: Place) => void;
}

export function PlacePreview({ place, onClose, onDetails }: PlacePreviewProps) {
  const router = useRouter();
  const category = CATEGORY_CONFIG[place.category];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 24,
        width: 280,
        background: "#111118",
        border: "0.5px solid #2A2A3E",
        borderRadius: 12,
        overflow: "hidden",
        zIndex: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      {/* Header image placeholder */}
      <div
        style={{
          height: 80,
          background: "linear-gradient(135deg, #1F1F2A 0%, #0D1520 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          position: "relative",
        }}
      >
        {category.emoji}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.5)",
            border: "none",
            borderRadius: "50%",
            width: 24,
            height: 24,
            cursor: "pointer",
            color: "#A0A0B8",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "10px 14px 14px" }}>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 11,
            color: category.color,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {category.label}
        </p>
        <p
          style={{
            margin: "0 0 2px",
            fontSize: 15,
            fontWeight: 500,
            color: "#F0F0F5",
            fontFamily: "Playfair Display, Georgia, serif",
          }}
        >
          {place.name}
        </p>
        <p style={{ margin: "0 0 6px", fontSize: 12, color: "#5A5A78" }}>
          {place.city ? `${place.city}, ` : ""}
          {place.country}
        </p>
        <p style={{ margin: "0 0 12px", fontSize: 13, letterSpacing: 1 }}>
          {getSpookySkulls(place.spookyScore)}
        </p>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 12,
            color: "#A0A0B8",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {place.description}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => router.push(`/place/${place.id}`)}
            style={{
              flex: 1,
              padding: "7px 0",
              background: "#1A1228",
              border: "0.5px solid #6D28D9",
              borderRadius: 7,
              color: "#A78BFA",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Read legend →
          </button>
          <button
            style={{
              padding: "7px 12px",
              background: "transparent",
              border: "0.5px solid #2A2A3E",
              borderRadius: 7,
              color: "#A0A0B8",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            + Collection
          </button>
        </div>
        <VisitedButton place={place} size="sm" />
      </div>
    </div>
  );
}
