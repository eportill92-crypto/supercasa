"use client";

import { useEffect } from "react";

// Registra el service worker (public/sw.js) del lado del cliente — necesario para que el
// navegador ofrezca "Instalar" / "Agregar a pantalla de inicio".
export default function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Si falla (ej. navegador viejo), la app sigue funcionando normal en el navegador,
        // solo no se podrá "instalar".
      });
    }
  }, []);

  return null;
}
