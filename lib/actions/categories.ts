"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

// Categorías = default del sistema (userId null, compartidas) + las propias que cada usuario
// crea (ej. "Cenas light"). Siempre se listan default primero, luego las propias, alfabético.

export async function listProductCategories() {
  const userId = await requireUserId();
  return prisma.productCategory.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: [{ userId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createProductCategory(formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || "🏷️";
  if (!name) throw new Error("La categoría necesita un nombre");

  const existing = await prisma.productCategory.findFirst({ where: { userId, name } });
  if (existing) return existing;

  const created = await prisma.productCategory.create({
    data: { userId, name, emoji, sortOrder: 100 },
  });

  revalidatePath("/pedir-super");
  revalidatePath("/lista-compra");
  revalidatePath("/inventario");
  return created;
}

// Wrapper de `createProductCategory` para usarse directo como `<form action=...>`, que exige
// que la acción no devuelva un valor (createProductCategory sí devuelve la fila creada, para
// cuando se llama a mano desde un client component como AddRecipeForm).
export async function createProductCategoryAction(formData: FormData): Promise<void> {
  await createProductCategory(formData);
}

// Productos ya conocidos del usuario (los haya pedido o no), agrupados por categoría, para
// que "Pedir el súper" pueda mostrar tiles expandibles en vez de un formulario en blanco.
export async function listProductsGroupedByCategory() {
  const userId = await requireUserId();
  const [categories, products] = await Promise.all([
    listProductCategories(),
    prisma.product.findMany({ where: { userId }, orderBy: { name: "asc" } }),
  ]);

  const byCategoryId = new Map(categories.map((c) => [c.id, { ...c, products: [] as typeof products }]));
  const uncategorized = { id: "sin-categoria", userId: null, name: "Sin categoría", emoji: "🏷️", sortOrder: 999, createdAt: new Date(), products: [] as typeof products };

  for (const product of products) {
    const bucket = product.productCategoryId ? byCategoryId.get(product.productCategoryId) : undefined;
    (bucket ?? uncategorized).products.push(product);
  }

  const groups = Array.from(byCategoryId.values());
  if (uncategorized.products.length > 0) groups.push(uncategorized);
  return groups;
}

export async function listRecipeCategories() {
  const userId = await requireUserId();
  return prisma.recipeCategory.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: [{ userId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createRecipeCategory(formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || "🍽️";
  if (!name) throw new Error("La categoría necesita un nombre");

  const existing = await prisma.recipeCategory.findFirst({ where: { userId, name } });
  if (existing) return existing;

  const created = await prisma.recipeCategory.create({
    data: { userId, name, emoji, sortOrder: 100 },
  });

  revalidatePath("/recetario");
  revalidatePath("/planear-semana");
  return created;
}
