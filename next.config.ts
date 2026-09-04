import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Las Server Actions rechazan (con un error genérico "unexpected response",
    // sin ni siquiera entrar a nuestro código) cualquier payload de más de 1MB por
    // default — una foto de celular normal pesa varios MB. La subimos a 10MB para
    // dar espacio a fotos/PDFs de recetas (el cliente igual comprime la imagen antes).
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
