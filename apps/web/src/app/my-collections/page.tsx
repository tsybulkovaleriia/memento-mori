"use client";

import Link from "next/link";
import { useCollectionsStore } from "@/lib/store";

export default function MyCollectionsPage() {
  const { collections, deleteCollection, createCollection } =
    useCollectionsStore();

  const handleShare = async (id: string) => {
    const url = `${window.location.origin}/c/${id}`;
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090F",
        color: "#F0F0F5",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Nav */}
      <div
        style={{
          borderBottom: "0.5px solid #1E1E2E",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/map"
          style={{ color: "#5A5A78", textDecoration: "none", fontSize: 13 }}
        >
          ← Map
        </Link>
        <span style={{ color: "#1E1E2E" }}>/</span>
        <span style={{ fontSize: 13, color: "#A0A0B8" }}>My Collections</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: 32,
              fontWeight: 500,
            }}
          >
            My Collections
          </h1>
          <button
            onClick={() => {
              const name = prompt("Collection name:");
              if (name?.trim()) createCollection(name.trim());
            }}
            style={{
              padding: "9px 16px",
              background: "#1A1228",
              border: "0.5px solid #6D28D9",
              borderRadius: 8,
              color: "#A78BFA",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            + New
          </button>
        </div>

        {collections.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 0",
              color: "#5A5A78",
            }}
          >
            <p style={{ fontSize: 40, marginBottom: 16 }}>🗺️</p>
            <p style={{ fontSize: 15 }}>No collections yet.</p>
            <p style={{ fontSize: 13 }}>
              Open a place and click "Add to collection" to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {collections.map((col) => (
              <div
                key={col.id}
                style={{
                  background: "#111118",
                  border: "0.5px solid #1E1E2E",
                  borderRadius: 12,
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: "0 0 4px",
                        fontFamily: "Playfair Display, Georgia, serif",
                        fontSize: 18,
                        fontWeight: 500,
                        color: "#F0F0F5",
                      }}
                    >
                      {col.name}
                    </h2>
                    <p style={{ margin: 0, fontSize: 13, color: "#5A5A78" }}>
                      {col.items.length} place{col.items.length !== 1 ? "s" : ""}
                      {" · "}
                      {new Date(col.updatedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${col.name}"?`))
                        deleteCollection(col.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3A3A56",
                      fontSize: 16,
                      cursor: "pointer",
                      padding: 4,
                      flexShrink: 0,
                    }}
                  >
                    🗑
                  </button>
                </div>

                {/* Places preview */}
                {col.items.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginBottom: 14,
                    }}
                  >
                    {col.items.slice(0, 5).map((item) => (
                      <span
                        key={item.place.id}
                        style={{
                          fontSize: 11,
                          padding: "3px 10px",
                          background: "#18181F",
                          border: "0.5px solid #2A2A3E",
                          borderRadius: 20,
                          color: "#A0A0B8",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.place.name}
                      </span>
                    ))}
                    {col.items.length > 5 && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "3px 10px",
                          color: "#5A5A78",
                        }}
                      >
                        +{col.items.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={`/c/${col.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <button
                      style={{
                        padding: "7px 14px",
                        background: "transparent",
                        border: "0.5px solid #2A2A3E",
                        borderRadius: 7,
                        color: "#A0A0B8",
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      View
                    </button>
                  </Link>
                  <button
                    onClick={() => handleShare(col.id)}
                    style={{
                      padding: "7px 14px",
                      background: "#1A1228",
                      border: "0.5px solid #6D28D9",
                      borderRadius: 7,
                      color: "#A78BFA",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    🔗 Share link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
