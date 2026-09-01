import { prisma } from "@/lib/prisma";

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

// Registra lo que se compró (a mano o vía automatización), repone la despensa y marca
// como resueltos los pendientes de la lista de compra que coincidan.
// Recibe el userId explícito para poder correrse fuera de una sesión HTTP (robot de GitHub Actions).
export async function registerOrderForUser(userId: string, input: RegisterOrderInput) {
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

  return order;
}
