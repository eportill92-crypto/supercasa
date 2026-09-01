"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function listPantry() {
  return prisma.pantryItem.findMany({
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });
}

export async function addPantryProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "pza").trim() || "pza";
  const category = String(formData.get("category") ?? "").trim() || null;
  const quantity = Number(formData.get("quantity") ?? 0);
  const minThreshold = Number(formData.get("minThreshold") ?? 0);
  const targetQtyRaw = formData.get("targetQty");
  const targetQty = targetQtyRaw ? Number(targetQtyRaw) : null;

  if (!name) throw new Error("El nombre del producto es obligatorio");

  const product = await prisma.product.upsert({
    where: { name },
    update: { unit, category: category ?? undefined },
    create: { name, unit, category },
  });

  await prisma.pantryItem.upsert({
    where: { productId: product.id },
    update: { quantity, minThreshold, targetQty },
    create: { productId: product.id, quantity, minThreshold, targetQty },
  });

  revalidatePath("/inventario");
  revalidatePath("/lista-compra");
  revalidatePath("/");
}

export async function updatePantryItem(formData: FormData) {
  const id = String(formData.get("id"));
  const quantity = Number(formData.get("quantity"));
  const minThreshold = Number(formData.get("minThreshold"));
  const targetQtyRaw = formData.get("targetQty");
  const targetQty = targetQtyRaw ? Number(targetQtyRaw) : null;

  await prisma.pantryItem.update({
    where: { id },
    data: { quantity, minThreshold, targetQty },
  });

  revalidatePath("/inventario");
  revalidatePath("/lista-compra");
  revalidatePath("/");
}

// Descuenta cantidad usada de la despensa (p.ej. "usé 1 leche") y lo registra como evento de consumo.
export async function useProduct(formData: FormData) {
  const productId = String(formData.get("productId"));
  const quantity = Number(formData.get("quantity") ?? 1);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (quantity <= 0) throw new Error("La cantidad usada debe ser mayor a 0");

  const pantryItem = await prisma.pantryItem.findUnique({ where: { productId } });
  if (!pantryItem) throw new Error("Ese producto no está en el inventario");

  await prisma.$transaction([
    prisma.pantryItem.update({
      where: { productId },
      data: { quantity: Math.max(0, pantryItem.quantity - quantity) },
    }),
    prisma.usageEvent.create({
      data: { productId, quantity, note },
    }),
  ]);

  revalidatePath("/inventario");
  revalidatePath("/lista-compra");
  revalidatePath("/");
}

export async function deletePantryItem(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.pantryItem.delete({ where: { id } });
  revalidatePath("/inventario");
  revalidatePath("/lista-compra");
  revalidatePath("/");
}
