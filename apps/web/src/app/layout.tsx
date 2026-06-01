import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memento Mori — Haunted Places Map",
  description:
    "Explore a curated map of haunted places, cursed locations, and spooky legends from around the world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
