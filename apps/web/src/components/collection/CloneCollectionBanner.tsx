"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCollectionsStore, type Collection } from "@/lib/store";
import { CATEGORY_CONFIG, getSpookySkulls } from "@/lib/categories";

export function CloneCollectionBanner({ uuid }: { uuid: string }) {
  const router = useRouter();
  const { collections, cloneCollection } = useCollectionsStore();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [cloned, setCloned] = useState(false);

  useEffect(() => {
    const found = collections.find((c) => c.id === uuid);
    setCollection(found ?? null);
  }, [collections, uuid]);

  if (!collection) {
    return (
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 40, marginBottom: 16 }}>👻</p>
        <p style={{ fontSize: 16, color: "#A0A0B8" }}>
          This collection doesn&apos;t exist — or it was never saved on this device.
        </p>
        <p style={{ fontSize: 13, color: "#5A5A78", marginTop: 8 }}>
          Collections are stored locally. The creator must share both the link
          and the same browser session, or we&apos;ll add cloud sync soon.
        </p>
        <Link href="/map" style={{ color: "#8B5CF6", fontSize: 13 }}>
          Explore the map →
        </Link>
      </div>
    );
  }

  const handleClone = () => {
    const copy = cloneCollection(collection);
    setCloned(true);
    setTimeout(() => router.push("/my-collections"), 1200);
  };

  return (
    <div>
      {/* Clone banner */}
      {!cloned ? (
        <div
          style={{
            background: "#1A1228",
            borderBottom: "0.5px solid #6D28D9",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#A78BFA" }}>
            You&apos;re viewing someone&apos;s collection · Save a copy to your own
          </p>
          <button
            onClick={handleClone}
            style={{
              padding: "7px 16px",
              background: "#8B5CF6",
              border: "none",
              borderRadius: 7,
              color: "#fff",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            Clone collection
          </button>
        </div>
      ) : (
        <div
          style={{
            background: "#0D1F18",
            borderBottom: "0.5px solid #10B981",
            padding: "12px 24px",
            fontSize: 13,
            color: "#10B981",
          }}
        >
          ✓ Cloned! Redirecting to your collections...
        </div>
      )}

      {/* Collection content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        <h1
          style={{
            fontFamily: "Playfair Display, Georgia, serif",
            fontSize: 32,
            fontWeight: 500,
            color: "#F0F0F5",
            margin: "0 0 8px",
          }}
        >
          {collection.name}
        </h1>
        {collection.description && (
          <p style={{ fontSize: 14, color: "#A0A0B8", margin: "0 0 8px" }}>
            {collection.description}
          </p>
        )}
        <p style={{ fontSize: 13, color: "#5A5A78", margin: "0 0 32px" }}>
          {collection.items.length} place
          {collection.items.length !== 1 ? "s" : ""}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {collection.items.map((item) => {
            const cat = CATEGORY_CONFIG[item.place.category];
            return (
              <Link
                key={item.place.id}
                href={`/place/${item.place.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    background: "#111118",
                    border: "0.5px solid #1E1E2E",
                    borderRadius: 10,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{cat.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 2px",
                        fontSize: 15,
                        fontWeight: 500,
                        color: "#F0F0F5",
                        fontFamily: "Playfair Display, Georgia, serif",
                      }}
                    >
                      {item.place.name}
                    </p>
                    <p style={{ margin: "0 0 4px", fontSize: 12, color: "#5A5A78" }}>
                      {item.place.city ? `${item.place.city}, ` : ""}
                      {item.place.country}
                    </p>
                    {item.note && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "#8B5CF6",
                          fontStyle: "italic",
                        }}
                      >
                        &ldquo;{item.note}&rdquo;
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 12, letterSpacing: 1 }}>
                    {getSpookySkulls(item.place.spookyScore)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
