/**
 * Script de exploración para correr en TU máquina (con internet real), no en este entorno
 * de desarrollo (que tiene bloqueado el acceso a lacomer.com.mx por política de red).
 *
 * Abre lacomer.com.mx paso a paso e imprime candidatos de selectores para cada paso del
 * flujo de compra, para que los copies a lib/lacomer/config.ts.
 *
 * Uso:
 *   npm run lacomer:explore
 *
 * Se abre un navegador visible (headful) para que puedas ir viendo cada paso. No inicia
 * sesión con ninguna cuenta real — solo inspecciona lo público (home, botón de login,
 * búsqueda, tarjeta de producto, carrito). Tú decides si luego quieres iniciar sesión a mano
 * en esa misma ventana para inspeccionar el checkout.
 */
import { chromium } from "playwright";
import { LACOMER_BASE_URL } from "../lib/lacomer/config";

async function main() {
  console.log(`Abriendo ${LACOMER_BASE_URL} ...`);
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(LACOMER_BASE_URL, { waitUntil: "domcontentloaded" });

  console.log("\n== HOME ==");
  console.log("Título de la página:", await page.title());
  await page.screenshot({ path: "lacomer-home.png" });
  console.log("Screenshot guardado en lacomer-home.png");

  console.log("\nBusca en la ventana el botón/enlace de 'Iniciar sesión' y anota:");
  console.log("- ¿Es un <a>, <button>, o abre un modal?");
  console.log("- Click derecho > Inspeccionar para ver su selector (id, class, texto exacto).");

  console.log("\nLa consola de Node se queda abierta con el navegador. Interactúa manualmente:");
  console.log("1. Da click en 'Iniciar sesión' y abre las devtools del navegador (F12) para ver");
  console.log("   los name/id de los inputs de email y password, y el selector del botón submit.");
  console.log("2. Usa la barra de búsqueda con algo como 'leche' y anota el selector de cada");
  console.log("   tarjeta de resultado, el botón 'Agregar al carrito' dentro de la tarjeta.");
  console.log("3. Abre el carrito y anota el selector del ícono y del botón para proceder al pago.");
  console.log("4. Si quieres, inicia sesión con tu cuenta real para ver el checkout y las opciones");
  console.log("   de método de pago (busca la opción de 'pago contra entrega' / 'efectivo').");
  console.log("\nCuando termines, cierra la ventana del navegador para terminar el script.");

  await page.waitForEvent("close", { timeout: 0 }).catch(() => undefined);
  await browser.close().catch(() => undefined);
  console.log("\nListo. Copia lo que encontraste a lib/lacomer/config.ts.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
