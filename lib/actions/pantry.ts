"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function listPantry() {
  const userId = await requireUserId();
  return prisma.pantryItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });
}

export async function addPantryProduct(formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "pza").trim() || "pza";
  const category = String(formData.get("category") ?? "").trim() || null;
  const productCategoryId = String(formData.get("productCategoryId") ?? "").trim() || null;
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const quantity = Number(formData.get("quantity") ?? 0);
  const minThreshold = Number(formData.get("minThreshold") ?? 0);
  const targetQtyRaw = formData.get("targetQty");
  const targetQty = targetQtyRaw ? Number(targetQtyRaw) : null;

  if (!name) throw new Error("El nombre del producto es obligatorio");

  const product = await prisma.product.upsert({
    where: { userId_name: { userId, name } },
    update: {
      unit,
      category: category ?? undefined,
      ...(productCategoryId ? { productCategoryId } : {}),
      ...(brand ? { brand } : {}),
    },
    create: { userId, name, unit, category, productCategoryId, brand },
  });

  await prisma.pantryItem.upsert({
    where: { productId: product.id },
    update: { quantity, minThreshold, targetQty },
    create: { userId, productId: product.id, quantity, minThreshold, targetQty },
  });

  revalidatePath("/inventario");
  revalidatePath("/lista-compra");
  revalidatePath("/pedir-super");
  revalidatePath("/");
}

export async function updatePantryItem(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id"));
  const quantity = Number(formData.get("quantity"));
  const minThreshold = Number(formData.get("minThreshold"));
  const targetQtyRaw = formData.get("targetQty");
  const targetQty = targetQtyRaw ? Number(targetQtyRaw) : null;

  await prisma.pantryItem.update({
    where: { id, userId },
    data: { quantity, minThreshold, targetQty },
  });

  revalidatePath("/inventario");
  revalidatePath("/lista-compra");
  revalidatePath("/");
}

// Descuenta cantidad usada de la despensa (p.ej. "usé 1 leche") y lo registra como evento de consumo.
export async function useProduct(formData: FormData) {
  const userId = await requireUserId();
  const productId = String(formData.get("productId"));
  const quantity = Number(formData.get("quantity") ?? 1);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (quantity <= 0) throw new Error("La cantidad usada debe ser mayor a 0");

  const pantryItem = await prisma.pantryItem.findUnique({ where: { productId } });
  if (!pantryItem || pantryItem.userId !== userId) {
    throw new Error("Ese producto no está en el inventario");
  }

  await prisma.$transaction([
    prisma.pantryItem.update({
      where: { productId },
      data: { quantity: Math.max(0, pantryItem.quantity - quantity) },
    }),
    prisma.usageEvent.create({
      data: { userId, productId, quantity, note },
    }),
  ]);

  revalidatePath("/inventario");
  revalidatePath("/lista-compra");
  revalidatePath("/");
}

export async function deletePantryItem(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id"));
  await prisma.pantryItem.deleteMany({ where: { id, userId } });
  revalidatePath("/inventario");
  revalidatePath("/lista-compra");
  revalidatePath("/");
}
