"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

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
export async function computeShoppingList(): Promise<ShoppingListRow[]> {
  const userId = await requireUserId();
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

export async function addManualShoppingItem(formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "pza").trim() || "pza";
  const quantity = Number(formData.get("quantity") ?? 1);

  if (!name) throw new Error("El nombre del producto es obligatorio");

  const product = await prisma.product.upsert({
    where: { userId_name: { userId, name } },
    update: {},
    create: { userId, name, unit },
  });

  await prisma.shoppingListItem.create({
    data: { userId, productId: product.id, quantity },
  });

  revalidatePath("/lista-compra");
}

export async function listManualShoppingItems() {
  const userId = await requireUserId();
  return prisma.shoppingListItem.findMany({
    where: { userId, fulfilled: false },
    include: { product: true },
  });
}

export async function removeManualShoppingItem(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id"));
  await prisma.shoppingListItem.deleteMany({ where: { id, userId } });
  revalidatePath("/lista-compra");
}
