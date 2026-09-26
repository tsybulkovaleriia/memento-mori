"use client";

import type { Place } from "@memento-mori/types";
import { useCollectionsStore } from "@/lib/store";
import { CollectionDrawer } from "./CollectionDrawer";

export function AddToCollectionButton({ place }: { place: Place }) {
  const { openDrawer, drawerOpen } = useCollectionsStore();

  return (
    <>
      <button
        onClick={openDrawer}
        style={{
          padding: "9px 18px",
          background: "#1A1228",
          border: "0.5px solid #6D28D9",
          borderRadius: 8,
          color: "#A78BFA",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
        }}
      >
        + Add to collection
      </button>
      {drawerOpen && <CollectionDrawer placeToAdd={place} />}
    </>
  );
}
