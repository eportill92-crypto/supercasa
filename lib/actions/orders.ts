"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { registerOrderForUser, type RegisterOrderInput } from "@/lib/orders-core";

export type { RegisterOrderItemInput, RegisterOrderInput } from "@/lib/orders-core";

export async function listOrders() {
  const userId = await requireUserId();
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { placedAt: "desc" },
  });
}

export async function getLastOrder() {
  const userId = await requireUserId();
  return prisma.order.findFirst({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { placedAt: "desc" },
  });
}

export async function listAllProducts() {
  const userId = await requireUserId();
  return prisma.product.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

// Registra lo que se compró (a mano o vía automatización), repone la despensa y marca
// como resueltos los pendientes de la lista de compra que coincidan.
export async function registerOrder(input: RegisterOrderInput) {
  const userId = await requireUserId();
  const order = await registerOrderForUser(userId, input);

  revalidatePath("/pedidos");
  revalidatePath("/inventario");
  revalidatePath("/lista-compra");
  revalidatePath("/");

  return order;
}
