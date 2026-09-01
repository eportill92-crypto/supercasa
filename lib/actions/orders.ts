"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export type RegisterOrderItemInput = {
  productId: string;
  quantity: number;
  unitPrice?: number | null;
};

export type RegisterOrderInput = {
  items: RegisterOrderItemInput[];
  source?: "manual" | "automatico";
  total?: number | null;
  notes?: string | null;
};

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
  const items = input.items.filter((i) => i.productId && i.quantity > 0);
  if (items.length === 0) throw new Error("El pedido necesita al menos un producto con cantidad");

  const order = await prisma.order.create({
    data: {
      userId,
      source: input.source ?? "manual",
      total: input.total ?? undefined,
      notes: input.notes ?? undefined,
      status: "completado",
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice ?? undefined,
        })),
      },
    },
  });

  for (const item of items) {
    const pantryItem = await prisma.pantryItem.findUnique({ where: { productId: item.productId } });
    if (pantryItem) {
      await prisma.pantryItem.update({
        where: { productId: item.productId },
        data: { quantity: pantryItem.quantity + item.quantity },
      });
    } else {
      await prisma.pantryItem.create({
        data: { userId, productId: item.productId, quantity: item.quantity, minThreshold: 0 },
      });
    }

    await prisma.shoppingListItem.updateMany({
      where: { productId: item.productId, userId, fulfilled: false },
      data: { fulfilled: true },
    });
  }

  revalidatePath("/pedidos");
  revalidatePath("/inventario");
  revalidatePath("/lista-compra");
  revalidatePath("/");

  return order;
}
