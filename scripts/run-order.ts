/**
 * Corre el pedido automático en La Comer desde la línea de comandos, usando la lista de
 * compra actual (lo que está por debajo del mínimo + lo agregado a mano en la app).
 * Pensado para correrse fuera de Vercel (cron local, GitHub Action, un servidor propio) ya
 * que la automatización con navegador puede tardar más de lo que permite una función
 * serverless.
 *
 * Uso:
 *   npm run lacomer:order
 */
import { computeShoppingList } from "../lib/actions/shopping-list";
import { runLacomerOrder } from "../lib/actions/automation";

async function main() {
  const list = await computeShoppingList();
  if (list.length === 0) {
    console.log("No hay nada pendiente en la lista de compra. Nada que pedir.");
    return;
  }

  console.log(`Pidiendo ${list.length} producto(s):`);
  for (const row of list) {
    console.log(`  - ${row.name}: ${row.suggestedQty} ${row.unit}`);
  }

  const result = await runLacomerOrder({
    items: list.map((row) => ({ productId: row.productId, quantity: row.suggestedQty })),
  });

  console.log(`\n${result.success ? "✔" : "✖"} ${result.message}`);
  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
