import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BiletUP",
    short_name: "BiletUP",
    description: "BiletUP is an event discovery and management platform — find events, get tickets, and follow organizers.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f6f3",
    theme_color: "#0079d3",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
