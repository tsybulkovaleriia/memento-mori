import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPlaceById, getNearbyPlaces } from "@/lib/places";
import { CATEGORY_CONFIG, getSpookySkulls } from "@/lib/categories";
import { SEED_PLACES } from "@/lib/seed-data";
import { NearbyPlaceCard } from "@/components/place/NearbyPlaceCard";
import { AddToCollectionButton } from "@/components/collection/AddToCollectionButton";
import { ShareButton } from "@/components/place/ShareButton";
import { PlaceMiniMap } from "@/components/place/PlaceMiniMap";
import { VisitedButton } from "@/components/place/VisitedButton";

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  return SEED_PLACES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = getPlaceById(params.id);
  if (!place) return {};
  return {
    title: `${place.name} — Memento Mori`,
    description: place.description,
  };
}

export default function PlacePage({ params }: Props) {
  const place = getPlaceById(params.id);
  if (!place) notFound();

  const nearby = getNearbyPlaces(place);
  const category = CATEGORY_CONFIG[place.category];

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
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          background: "rgba(9,9,15,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "0.5px solid #1E1E2E",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/map"
            style={{ color: "#5A5A78", textDecoration: "none", fontSize: 13 }}
          >
            ← Map
          </Link>
          <span style={{ color: "#1E1E2E" }}>/</span>
          <span
            style={{
              fontSize: 13,
              color: "#A0A0B8",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 200,
            }}
          >
            {place.name}
          </span>
        </div>
        <ShareButton name={place.name} />
      </div>

      {/* Hero */}
      <div
        style={{
          paddingTop: 56,
          background: "linear-gradient(180deg, #111118 0%, #09090F 100%)",
          borderBottom: "0.5px solid #1E1E2E",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 40px" }}>
          {/* Category badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: "#18181F",
              border: "0.5px solid #2A2A3E",
              borderRadius: 20,
              fontSize: 12,
              color: category.color,
              marginBottom: 20,
            }}
          >
            <span>{category.emoji}</span>
            <span>{category.label}</span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 500,
              color: "#F0F0F5",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            {place.name}
          </h1>

          {/* Location + score */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 13, color: "#5A5A78" }}>
              📍 {place.city ? `${place.city}, ` : ""}
              {place.country}
            </span>
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                color: "#3A3A56",
              }}
            >
              {place.lat.toFixed(4)}° N, {place.lng.toFixed(4)}°
            </span>
            <span style={{ fontSize: 14, letterSpacing: 2 }}>
              {getSpookySkulls(place.spookyScore)}
            </span>
          </div>

          {/* Description */}
          <p style={{ fontSize: 16, color: "#A0A0B8", lineHeight: 1.7, margin: 0 }}>
            {place.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>

        {/* Legend */}
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: 22,
              fontWeight: 500,
              color: "#F0F0F5",
              margin: "0 0 20px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ color: "#8B5CF6" }}>☽</span> The Legend
          </h2>
          <div
            style={{
              background: "#111118",
              border: "0.5px solid #1E1E2E",
              borderLeft: "2px solid #6D28D9",
              borderRadius: "0 8px 8px 0",
              padding: "20px 24px",
            }}
          >
            <p style={{ fontSize: 15, color: "#C0C0D8", lineHeight: 1.8, margin: 0 }}>
              {place.legend}
            </p>
          </div>
        </section>

        {/* Location */}
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: 22,
              fontWeight: 500,
              color: "#F0F0F5",
              margin: "0 0 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ color: "#8B5CF6" }}>◎</span> Location
          </h2>
          <PlaceMiniMap lat={place.lat} lng={place.lng} name={place.name} />
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 12,
              padding: "10px 14px",
              background: "#111118",
              border: "0.5px solid #1E1E2E",
              borderRadius: 8,
            }}
          >
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: "#5A5A78" }}>Latitude</p>
              <p style={{ margin: 0, fontSize: 13, fontFamily: "JetBrains Mono, monospace", color: "#A0A0B8" }}>
                {place.lat.toFixed(6)}°
              </p>
            </div>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: "#5A5A78" }}>Longitude</p>
              <p style={{ margin: 0, fontSize: 13, fontFamily: "JetBrains Mono, monospace", color: "#A0A0B8" }}>
                {place.lng.toFixed(6)}°
              </p>
            </div>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: "#5A5A78" }}>Country</p>
              <p style={{ margin: 0, fontSize: 13, color: "#A0A0B8" }}>{place.country}</p>
            </div>
          </div>
        </section>

        {/* Add to collection */}
        <section
          style={{
            marginBottom: 48,
            background: "#111118",
            border: "0.5px solid #2A2A3E",
            borderRadius: 12,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 14, color: "#F0F0F5", fontWeight: 500 }}>
              Save to a collection
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#5A5A78" }}>
              Build your haunted road trip, share with friends.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <AddToCollectionButton place={place} />
            <VisitedButton place={place} />
          </div>
        </section>

        {/* Nearby */}
        {nearby.length > 0 && (
          <section>
            <h2
              style={{
                fontFamily: "Playfair Display, Georgia, serif",
                fontSize: 22,
                fontWeight: 500,
                color: "#F0F0F5",
                margin: "0 0 20px",
              }}
            >
              Nearby haunted places
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {nearby.map((p) => (
                <NearbyPlaceCard key={p.id} place={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
