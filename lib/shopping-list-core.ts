import { prisma } from "@/lib/prisma";
import { getMonday, addDays } from "@/lib/date-utils";

export type ShoppingListRow = {
  productId: string;
  name: string;
  unit: string;
  suggestedQty: number;
  reason: "agregado_manual" | "plan_semana" | "pedido_anterior";
  manualItemId?: string;
};

// La lista se arma sola con tres fuentes (no con inventario/despensa, muy difícil de mantener
// al día): lo agregado a mano, los ingredientes de lo que planeaste cocinar esta semana (y
// todavía no preparas), y lo que pediste la última vez por si quieres repetirlo.
// Recibe el userId explícito (en vez de leerlo de la sesión) para poder correrse tanto desde
// una Server Action (app web) como desde un script fuera de una sesión HTTP (robot de GitHub Actions).
export async function computeShoppingListForUser(userId: string): Promise<ShoppingListRow[]> {
  const weekStart = getMonday(new Date());
  const weekEnd = addDays(weekStart, 7);

  const [manualItems, plannedEntries, lastOrder] = await Promise.all([
    prisma.shoppingListItem.findMany({
      where: { userId, fulfilled: false },
      include: { product: true },
      orderBy: { addedAt: "asc" },
    }),
    prisma.mealPlanEntry.findMany({
      where: { userId, date: { gte: weekStart, lt: weekEnd }, prepared: false },
      include: { recipe: { include: { ingredients: true } } },
    }),
    prisma.order.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { placedAt: "desc" },
    }),
  ]);

  const rows: ShoppingListRow[] = [];
  const rowByProductId = new Map<string, ShoppingListRow>();

  function upsertRow(row: ShoppingListRow) {
    const existing = rowByProductId.get(row.productId);
    if (existing) {
      existing.suggestedQty = Math.max(existing.suggestedQty, row.suggestedQty);
      if (row.manualItemId) existing.manualItemId = row.manualItemId;
      return;
    }
    rowByProductId.set(row.productId, row);
    rows.push(row);
  }

  for (const manual of manualItems) {
    upsertRow({
      productId: manual.productId,
      name: manual.product.name,
      unit: manual.product.unit,
      suggestedQty: manual.quantity,
      reason: "agregado_manual",
      manualItemId: manual.id,
    });
  }

  // Ingredientes de las comidas planeadas esta semana que aún no se preparan, sumados por
  // nombre (una receta puede repetirse en varios días) y escalados según las porciones reales.
  const neededByName = new Map<string, { unit: string; quantity: number }>();
  for (const entry of plannedEntries) {
    const scale = entry.servings / entry.recipe.servings;
    for (const ing of entry.recipe.ingredients) {
      const prev = neededByName.get(ing.name);
      const qty = ing.quantity * scale;
      if (prev) prev.quantity += qty;
      else neededByName.set(ing.name, { unit: ing.unit, quantity: qty });
    }
  }

  for (const [name, { unit, quantity }] of neededByName) {
    const product = await prisma.product.upsert({
      where: { userId_name: { userId, name } },
      update: {},
      create: { userId, name, unit },
    });
    upsertRow({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      suggestedQty: Math.round(quantity * 100) / 100,
      reason: "plan_semana",
    });
  }

  if (lastOrder) {
    for (const item of lastOrder.items) {
      upsertRow({
        productId: item.productId,
        name: item.product.name,
        unit: item.product.unit,
        suggestedQty: item.quantity,
        reason: "pedido_anterior",
      });
    }
  }

  return rows;
}
