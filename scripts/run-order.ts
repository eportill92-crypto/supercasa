/**
 * Corre el pedido automático en La Comer para uno o varios usuarios, usando la lista de compra
 * de cada quien (lo que está por debajo del mínimo + lo agregado a mano en la app).
 *
 * Pensado para correrse fuera de Vercel — un cron local, un servidor propio, o (el caso
 * principal) el workflow de GitHub Actions en .github/workflows/lacomer-order.yml — ya que la
 * automatización con navegador puede tardar más de lo que permite una función serverless.
 *
 * Modo de uso:
 *   - Con TARGET_USER_ID definido: corre solo para ese usuario (dispara desde el botón "Pedir
 *     en La Comer" de la app, vía workflow_dispatch con el userId de quien lo pidió).
 *   - Sin TARGET_USER_ID: corre para todos los usuarios con autoOrderEnabled=true (la corrida
 *     programada / cron).
 *
 *   npm run lacomer:order
 *   TARGET_USER_ID=usr_xxx npm run lacomer:order
 */
import { prisma } from "../lib/prisma";
import { computeShoppingListForUser } from "../lib/shopping-list-core";
import { runLacomerOrderForUser } from "../lib/automation-core";

async function runForUser(userId: string, label: string) {
  const list = await computeShoppingListForUser(userId);
  if (list.length === 0) {
    console.log(`[${label}] Nada pendiente en la lista de compra. Nada que pedir.`);
    return true;
  }

  console.log(`[${label}] Pidiendo ${list.length} producto(s):`);
  for (const row of list) {
    console.log(`  - ${row.name}: ${row.suggestedQty} ${row.unit}`);
  }

  const result = await runLacomerOrderForUser(userId, {
    items: list.map((row) => ({ productId: row.productId, quantity: row.suggestedQty })),
  });

  console.log(`[${label}] ${result.success ? "✔" : "✖"} ${result.message}`);
  return result.success;
}

async function main() {
  const targetUserId = process.env.TARGET_USER_ID?.trim();
  let ok = true;

  if (targetUserId) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      console.error(`No existe el usuario ${targetUserId}`);
      process.exit(1);
    }
    ok = await runForUser(user.id, user.email);
  } else {
    const users = await prisma.user.findMany({ where: { autoOrderEnabled: true } });
    if (users.length === 0) {
      console.log("Nadie tiene activado el pedido automático programado. Nada que hacer.");
      return;
    }
    for (const user of users) {
      const success = await runForUser(user.id, user.email);
      ok = ok && success;
    }
  }

  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
