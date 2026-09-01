"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { computeShoppingListForUser, type ShoppingListRow } from "@/lib/shopping-list-core";

export type { ShoppingListRow };

// Combina lo que está por debajo del mínimo en la despensa con lo agregado a mano,
// sugiriendo cuánto comprar con base en la cantidad objetivo (o el doble del mínimo si no hay una).
export async function computeShoppingList(): Promise<ShoppingListRow[]> {
  const userId = await requireUserId();
  return computeShoppingListForUser(userId);
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
