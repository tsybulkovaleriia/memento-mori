"use client";

import { useState } from "react";
import { useCollectionsStore } from "@/lib/store";
import type { Place } from "@memento-mori/types";

interface CollectionDrawerProps {
  placeToAdd?: Place;
}

export function CollectionDrawer({ placeToAdd }: CollectionDrawerProps) {
  const {
    collections,
    drawerOpen,
    closeDrawer,
    createCollection,
    addToCollection,
    removeFromCollection,
    deleteCollection,
  } = useCollectionsStore();

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  if (!drawerOpen) return null;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const col = createCollection(newName.trim());
    if (placeToAdd) addToCollection(col.id, placeToAdd);
    setNewName("");
    setCreating(false);
  };

  const handleAddToExisting = (collectionId: string) => {
    if (!placeToAdd) return;
    addToCollection(collectionId, placeToAdd);
  };

  const isInCollection = (collectionId: string) =>
    placeToAdd
      ? collections
          .find((c) => c.id === collectionId)
          ?.items.some((i) => i.place.id === placeToAdd.id) ?? false
      : false;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 40,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          background: "#111118",
          borderLeft: "0.5px solid #2A2A3E",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "0.5px solid #1E1E2E",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: 18,
              fontWeight: 500,
              color: "#F0F0F5",
            }}
          >
            {placeToAdd ? `Add to collection` : "My Collections"}
          </h2>
          <button
            onClick={closeDrawer}
            style={{
              background: "none",
              border: "none",
              color: "#5A5A78",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {placeToAdd && (
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "0.5px solid #1E1E2E",
              background: "#18181F",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#A0A0B8" }}>
              Adding:{" "}
              <span style={{ color: "#F0F0F5", fontWeight: 500 }}>
                {placeToAdd.name}
              </span>
            </p>
          </div>
        )}

        {/* Collections list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {collections.length === 0 && !creating && (
            <p
              style={{
                textAlign: "center",
                color: "#5A5A78",
                fontSize: 13,
                padding: "32px 20px",
              }}
            >
              No collections yet.
              <br />
              Create one below.
            </p>
          )}

          {collections.map((col) => {
            const added = isInCollection(col.id);
            return (
              <div
                key={col.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 20px",
                  borderBottom: "0.5px solid #1E1E2E",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#F0F0F5",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {col.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#5A5A78" }}>
                    {col.items.length} place{col.items.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {placeToAdd ? (
                  <button
                    onClick={() =>
                      added
                        ? removeFromCollection(col.id, placeToAdd.id)
                        : handleAddToExisting(col.id)
                    }
                    style={{
                      padding: "6px 12px",
                      background: added ? "#18181F" : "#1A1228",
                      border: `0.5px solid ${added ? "#2A2A3E" : "#6D28D9"}`,
                      borderRadius: 7,
                      color: added ? "#5A5A78" : "#A78BFA",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {added ? "✓ Added" : "+ Add"}
                  </button>
                ) : (
                  <button
                    onClick={() => deleteCollection(col.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3A3A56",
                      fontSize: 16,
                      cursor: "pointer",
                      padding: 4,
                    }}
                    title="Delete collection"
                  >
                    🗑
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Create new */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "0.5px solid #1E1E2E",
          }}
        >
          {creating ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setCreating(false);
                }}
                placeholder="Collection name..."
                style={{
                  flex: 1,
                  background: "#18181F",
                  border: "0.5px solid #3A3A56",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#F0F0F5",
                  fontSize: 13,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button
                onClick={handleCreate}
                style={{
                  padding: "8px 14px",
                  background: "#1A1228",
                  border: "0.5px solid #6D28D9",
                  borderRadius: 8,
                  color: "#A78BFA",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Create
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              style={{
                width: "100%",
                padding: "10px",
                background: "transparent",
                border: "0.5px dashed #2A2A3E",
                borderRadius: 8,
                color: "#5A5A78",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              + New collection
            </button>
          )}
        </div>
      </div>
    </>
  );
}
