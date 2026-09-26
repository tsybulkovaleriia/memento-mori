import type { Metadata } from "next";
import Link from "next/link";
import { CloneCollectionBanner } from "@/components/collection/CloneCollectionBanner";

interface Props {
  params: { uuid: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Haunted Collection — Memento Mori",
    description: "A curated list of haunted places shared via Memento Mori.",
  };
}

export default function SharedCollectionPage({ params }: Props) {
  const { uuid } = params;
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
      </div>

      {/* Clone banner + collection content rendered client-side */}
      <CloneCollectionBanner uuid={uuid} />
    </div>
  );
}
