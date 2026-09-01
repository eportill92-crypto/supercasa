import { prisma } from "@/lib/prisma";

export type ShoppingListRow = {
  productId: string;
  name: string;
  unit: string;
  currentQty: number;
  minThreshold: number;
  suggestedQty: number;
  reason: "stock_bajo" | "agregado_manual";
  manualItemId?: string;
};

// Combina lo que está por debajo del mínimo en la despensa con lo agregado a mano,
// sugiriendo cuánto comprar con base en la cantidad objetivo (o el doble del mínimo si no hay una).
// Recibe el userId explícito (en vez de leerlo de la sesión) para poder correrse tanto desde
// una Server Action (app web) como desde un script fuera de una sesión HTTP (robot de GitHub Actions).
export async function computeShoppingListForUser(userId: string): Promise<ShoppingListRow[]> {
  const [lowStock, manualItems] = await Promise.all([
    prisma.pantryItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { product: { name: "asc" } },
    }),
    prisma.shoppingListItem.findMany({
      where: { userId, fulfilled: false },
      include: { product: true },
      orderBy: { addedAt: "asc" },
    }),
  ]);

  const rows: ShoppingListRow[] = [];

  for (const item of lowStock) {
    if (item.quantity > item.minThreshold) continue;
    const target = item.targetQty ?? item.minThreshold * 2;
    const suggestedQty = Math.max(target - item.quantity, item.minThreshold > 0 ? item.minThreshold : 1);
    rows.push({
      productId: item.productId,
      name: item.product.name,
      unit: item.product.unit,
      currentQty: item.quantity,
      minThreshold: item.minThreshold,
      suggestedQty: Math.round(suggestedQty * 100) / 100,
      reason: "stock_bajo",
    });
  }

  for (const manual of manualItems) {
    const alreadyListed = rows.find((r) => r.productId === manual.productId);
    if (alreadyListed) {
      alreadyListed.suggestedQty = Math.max(alreadyListed.suggestedQty, manual.quantity);
      alreadyListed.manualItemId = manual.id;
      continue;
    }
    rows.push({
      productId: manual.productId,
      name: manual.product.name,
      unit: manual.product.unit,
      currentQty: 0,
      minThreshold: 0,
      suggestedQty: manual.quantity,
      reason: "agregado_manual",
      manualItemId: manual.id,
    });
  }

  return rows;
}
