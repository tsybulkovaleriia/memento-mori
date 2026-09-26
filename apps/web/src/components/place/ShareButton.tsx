"use client";

import { useState } from "react";

export function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: name, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        background: "transparent",
        border: "0.5px solid #2A2A3E",
        borderRadius: 8,
        color: copied ? "#10B981" : "#A0A0B8",
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "color 0.2s",
      }}
    >
      {copied ? "✓ Copied!" : "🔗 Share"}
    </button>
  );
}
