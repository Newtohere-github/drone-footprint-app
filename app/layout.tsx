import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DroneFootprint AI · Building Segmentation",
  description:
    "Real-time geospatial webapp for ML-powered building footprint segmentation from drone/aerial imagery. Built with MapLibre GL + deck.gl and open-source datasets.",
  keywords: [
    "drone imagery",
    "building segmentation",
    "geospatial",
    "machine learning",
    "MapLibre",
    "GIS",
    "portfolio",
  ],
  openGraph: {
    title: "DroneFootprint AI · Building Segmentation",
    description:
      "Interactive 3D building footprint segmentation from drone imagery. Powered by Microsoft Global ML Building Footprints & open-source datasets.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
