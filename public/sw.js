// Service worker mínimo: solo existir con un listener de "fetch" es lo que Chrome/Android
// exige para considerar la app "instalable" (criterio de PWA). No cachea nada a propósito —
// SuperCasa es datos en vivo (inventario, pedidos), así que no tiene sentido servir una copia
// vieja offline; simplemente deja pasar cada solicitud a la red como si no existiera.
self.addEventListener("fetch", () => {});
