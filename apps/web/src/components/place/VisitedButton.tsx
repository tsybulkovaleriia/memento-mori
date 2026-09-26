"use client";

import { useCollectionsStore } from "@/lib/store";
import type { Place } from "@memento-mori/types";

interface Props {
  place: Place;
  size?: "sm" | "md";
}

export function VisitedButton({ place, size = "md" }: Props) {
  const { toggleVisited, isVisited } = useCollectionsStore();
  const visited = isVisited(place.id);

  const sm = size === "sm";

  return (
    <button
      onClick={() => toggleVisited(place.id)}
      title={visited ? "Mark as not visited" : "Mark as visited"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: sm ? 4 : 6,
        padding: sm ? "4px 8px" : "7px 14px",
        background: visited ? "#0A1F0A" : "transparent",
        border: `0.5px solid ${visited ? "#16A34A" : "#2A2A3E"}`,
        borderRadius: sm ? 6 : 8,
        color: visited ? "#4ADE80" : "#5A5A78",
        fontSize: sm ? 11 : 13,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      <span>{visited ? "✓" : "○"}</span>
      <span>{visited ? "Visited" : "Mark visited"}</span>
    </button>
  );
}
