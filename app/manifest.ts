import type { MetadataRoute } from "next";

// Next.js sirve esto solo en /manifest.webmanifest y agrega el <link rel="manifest">
// automáticamente — es lo que le dice al navegador que la app se puede "instalar"
// (ícono en pantalla de inicio/escritorio, sin pasar por ninguna tienda).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SuperCasa",
    short_name: "SuperCasa",
    description: "Inventario de despensa y pedidos automáticos a La Comer",
    start_url: "/",
    display: "standalone",
    background_color: "#f5faf9",
    theme_color: "#2563eb",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
