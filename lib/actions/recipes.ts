"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export type RecipeIngredientInput = {
  productName: string;
  unit: string;
  quantity: number;
};

export type AddRecipeInput = {
  name: string;
  mealType?: string;
  recipeCategoryId?: string;
  servings: number;
  instructions?: string;
  ingredients: RecipeIngredientInput[];
};

export type RecipeRecommendation = {
  id: string;
  name: string;
  mealType: string | null;
  recipeCategoryId: string | null;
  recipeCategoryName: string | null;
  recipeCategoryEmoji: string | null;
  servings: number;
  instructions: string | null;
  source: string;
  timesUsedByMe: number;
  haveCount: number;
  totalCount: number;
  missing: { name: string; unit: string; needed: number; have: number }[];
};

// Recetas ordenadas para recomendar qué cocinar con lo que hay ahora en el inventario.
// Prioriza: 1) recetas propias, 2) recetas que este usuario ya cocinó, 3) qué tanto de la
// receta ya tiene en casa. Incluye las recetas base (compartidas) y las propias del usuario.
export async function getRecipeRecommendations(): Promise<RecipeRecommendation[]> {
  const userId = await requireUserId();

  const [recipes, pantryItems, myUsageCounts] = await Promise.all([
    prisma.recipe.findMany({
      where: { OR: [{ userId: null }, { userId }] },
      include: { ingredients: true, recipeCategory: true },
    }),
    prisma.pantryItem.findMany({ where: { userId }, include: { product: true } }),
    prisma.mealPlanEntry.groupBy({
      by: ["recipeId"],
      where: { userId, prepared: true },
      _count: { _all: true },
    }),
  ]);

  const pantryByName = new Map(pantryItems.map((p) => [p.product.name, p.quantity]));
  const myUsageByRecipe = new Map(myUsageCounts.map((c) => [c.recipeId, c._count._all]));

  const recommendations: RecipeRecommendation[] = recipes.map((recipe) => {
    const missing: RecipeRecommendation["missing"] = [];
    let haveCount = 0;

    for (const ing of recipe.ingredients) {
      const have = pantryByName.get(ing.name) ?? 0;
      if (have >= ing.quantity) {
        haveCount += 1;
      } else {
        missing.push({
          name: ing.name,
          unit: ing.unit,
          needed: Math.round((ing.quantity - have) * 100) / 100,
          have,
        });
      }
    }

    return {
      id: recipe.id,
      name: recipe.name,
      mealType: recipe.mealType,
      recipeCategoryId: recipe.recipeCategoryId,
      recipeCategoryName: recipe.recipeCategory?.name ?? null,
      recipeCategoryEmoji: recipe.recipeCategory?.emoji ?? null,
      servings: recipe.servings,
      instructions: recipe.instructions,
      source: recipe.userId ? "user" : "seed",
      timesUsedByMe: myUsageByRecipe.get(recipe.id) ?? 0,
      haveCount,
      totalCount: recipe.ingredients.length,
      missing,
    };
  });

  recommendations.sort((a, b) => {
    const priority = (r: RecipeRecommendation) => (r.source === "user" ? 2 : r.timesUsedByMe > 0 ? 1 : 0);
    const pDiff = priority(b) - priority(a);
    if (pDiff !== 0) return pDiff;

    const matchA = a.totalCount === 0 ? 0 : a.haveCount / a.totalCount;
    const matchB = b.totalCount === 0 ? 0 : b.haveCount / b.totalCount;
    if (matchB !== matchA) return matchB - matchA;

    return b.timesUsedByMe - a.timesUsedByMe;
  });

  return recommendations;
}

export async function addRecipe(input: AddRecipeInput) {
  const userId = await requireUserId();
  const ingredients = input.ingredients.filter((i) => i.productName.trim() && i.quantity > 0);
  if (!input.name.trim()) throw new Error("La receta necesita un nombre");
  if (ingredients.length === 0) throw new Error("Agrega al menos un ingrediente");

  await prisma.recipe.create({
    data: {
      userId,
      name: input.name.trim(),
      source: "user",
      mealType: input.mealType || undefined,
      recipeCategoryId: input.recipeCategoryId || undefined,
      servings: input.servings > 0 ? input.servings : 4,
      instructions: input.instructions?.trim() || undefined,
      ingredients: {
        create: ingredients.map((i) => ({
          name: i.productName.trim(),
          unit: i.unit || "pza",
          quantity: i.quantity,
        })),
      },
    },
  });

  revalidatePath("/recetas");
  revalidatePath("/menu-semanal");
}

export async function deleteRecipe(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id"));
  await prisma.recipe.deleteMany({ where: { id, userId } });
  revalidatePath("/recetas");
  revalidatePath("/menu-semanal");
}

// Agrega a la lista de compra lo que le falta a una receta para poder cocinarla.
export async function addMissingIngredientsToShoppingList(recipeId: string) {
  const userId = await requireUserId();
  const recommendations = await getRecipeRecommendations();
  const recipe = recommendations.find((r) => r.id === recipeId);
  if (!recipe) throw new Error("Receta no encontrada");

  for (const item of recipe.missing) {
    const product = await prisma.product.upsert({
      where: { userId_name: { userId, name: item.name } },
      update: {},
      create: { userId, name: item.name, unit: item.unit },
    });
    await prisma.shoppingListItem.create({
      data: { userId, productId: product.id, quantity: item.needed },
    });
  }

  revalidatePath("/lista-compra");
  revalidatePath("/recetas");
}

export async function listAllRecipes() {
  const userId = await requireUserId();
  return prisma.recipe.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    include: { ingredients: true, recipeCategory: true },
    orderBy: { name: "asc" },
  });
}

// Recetas que se pueden hacer (o casi) con una lista de ingredientes que el usuario escribe a
// mano (ej. "huevo, leche, jitomate"), para el buscador por ingrediente del Recetario.
export async function searchRecipesByIngredients(ingredientsText: string) {
  const have = ingredientsText
    .split(/[,\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (have.length === 0) return [];

  const recipes = await listAllRecipes();

  return recipes
    .map((recipe) => {
      const missing = recipe.ingredients.filter(
        (ing) => !have.some((h) => ing.name.toLowerCase().includes(h) || h.includes(ing.name.toLowerCase()))
      );
      return {
        id: recipe.id,
        name: recipe.name,
        servings: recipe.servings,
        totalCount: recipe.ingredients.length,
        missing: missing.map((m) => m.name),
      };
    })
    .filter((r) => r.totalCount > 0 && r.missing.length < r.totalCount)
    .sort((a, b) => a.missing.length - b.missing.length);
}
