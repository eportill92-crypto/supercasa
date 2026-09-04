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
  const productCategoryId = String(formData.get("productCategoryId") ?? "").trim() || null;
  const brand = String(formData.get("brand") ?? "").trim() || null;

  if (!name) throw new Error("El nombre del producto es obligatorio");

  const product = await prisma.product.upsert({
    where: { userId_name: { userId, name } },
    update: {
      ...(productCategoryId ? { productCategoryId } : {}),
      ...(brand ? { brand } : {}),
    },
    create: { userId, name, unit, productCategoryId, brand },
  });

  await prisma.shoppingListItem.create({
    data: { userId, productId: product.id, quantity },
  });

  revalidatePath("/lista-compra");
  revalidatePath("/pedir-super");
  revalidatePath("/");
}

export type ShoppingListRowWithCategory = ShoppingListRow & {
  brand: string | null;
  categoryName: string;
  categoryEmoji: string;
};

// La lista calculada, con la categoría de cada producto pegada y ordenada por categoría —
// así "Mi lista" y "Pedir el súper" la pueden mostrar agrupada sin volver a consultar la BD.
export async function computeShoppingListWithCategory(): Promise<ShoppingListRowWithCategory[]> {
  const userId = await requireUserId();
  const [rows, products] = await Promise.all([
    computeShoppingListForUser(userId),
    prisma.product.findMany({ where: { userId }, include: { productCategory: true } }),
  ]);

  const byProductId = new Map(products.map((p) => [p.id, p]));

  const withCategory = rows.map((row) => {
    const product = byProductId.get(row.productId);
    return {
      ...row,
      brand: product?.brand ?? null,
      categoryName: product?.productCategory?.name ?? "Sin categoría",
      categoryEmoji: product?.productCategory?.emoji ?? "🏷️",
    };
  });

  withCategory.sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name));
  return withCategory;
}

// Igual que addManualShoppingItem pero para un producto que ya existe (se conoce su id) —
// lo usa "Pedir el súper" al agregar desde una categoría ya expandida, para no re-crear el
// producto por nombre.
export async function addExistingProductToList(formData: FormData) {
  const userId = await requireUserId();
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  if (!productId || quantity <= 0) return;

  const product = await prisma.product.findFirst({ where: { id: productId, userId } });
  if (!product) throw new Error("Producto no encontrado");

  await prisma.shoppingListItem.create({ data: { userId, productId, quantity } });

  revalidatePath("/lista-compra");
  revalidatePath("/pedir-super");
  revalidatePath("/");
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
