"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type RecipeIngredientInput = {
  productName: string;
  unit: string;
  quantity: number;
};

export type AddRecipeInput = {
  name: string;
  mealType?: string;
  servings: number;
  instructions?: string;
  ingredients: RecipeIngredientInput[];
};

export type RecipeRecommendation = {
  id: string;
  name: string;
  mealType: string | null;
  servings: number;
  instructions: string | null;
  source: string;
  timesUsed: number;
  haveCount: number;
  totalCount: number;
  missing: { productId: string; name: string; unit: string; needed: number; have: number }[];
};

// Recetas ordenadas para recomendar qué cocinar con lo que hay ahora en el inventario.
// Prioriza: 1) recetas propias, 2) recetas ya cocinadas antes, 3) qué tanto de la receta ya
// tienes en casa.
export async function getRecipeRecommendations(): Promise<RecipeRecommendation[]> {
  const [recipes, pantryItems] = await Promise.all([
    prisma.recipe.findMany({ include: { ingredients: { include: { product: true } } } }),
    prisma.pantryItem.findMany(),
  ]);

  const pantryByProduct = new Map(pantryItems.map((p) => [p.productId, p.quantity]));

  const recommendations: RecipeRecommendation[] = recipes.map((recipe) => {
    const missing: RecipeRecommendation["missing"] = [];
    let haveCount = 0;

    for (const ing of recipe.ingredients) {
      const have = pantryByProduct.get(ing.productId) ?? 0;
      if (have >= ing.quantity) {
        haveCount += 1;
      } else {
        missing.push({
          productId: ing.productId,
          name: ing.product.name,
          unit: ing.product.unit,
          needed: Math.round((ing.quantity - have) * 100) / 100,
          have,
        });
      }
    }

    return {
      id: recipe.id,
      name: recipe.name,
      mealType: recipe.mealType,
      servings: recipe.servings,
      instructions: recipe.instructions,
      source: recipe.source,
      timesUsed: recipe.timesUsed,
      haveCount,
      totalCount: recipe.ingredients.length,
      missing,
    };
  });

  recommendations.sort((a, b) => {
    const priority = (r: RecipeRecommendation) => (r.source === "user" ? 2 : r.timesUsed > 0 ? 1 : 0);
    const pDiff = priority(b) - priority(a);
    if (pDiff !== 0) return pDiff;

    const matchA = a.totalCount === 0 ? 0 : a.haveCount / a.totalCount;
    const matchB = b.totalCount === 0 ? 0 : b.haveCount / b.totalCount;
    if (matchB !== matchA) return matchB - matchA;

    return b.timesUsed - a.timesUsed;
  });

  return recommendations;
}

export async function addRecipe(input: AddRecipeInput) {
  const ingredients = input.ingredients.filter((i) => i.productName.trim() && i.quantity > 0);
  if (!input.name.trim()) throw new Error("La receta necesita un nombre");
  if (ingredients.length === 0) throw new Error("Agrega al menos un ingrediente");

  const products = await Promise.all(
    ingredients.map((i) =>
      prisma.product.upsert({
        where: { name: i.productName.trim() },
        update: {},
        create: { name: i.productName.trim(), unit: i.unit || "pza" },
      })
    )
  );

  await prisma.recipe.create({
    data: {
      name: input.name.trim(),
      source: "user",
      mealType: input.mealType || undefined,
      servings: input.servings > 0 ? input.servings : 4,
      instructions: input.instructions?.trim() || undefined,
      ingredients: {
        create: ingredients.map((i, idx) => ({
          productId: products[idx].id,
          quantity: i.quantity,
        })),
      },
    },
  });

  revalidatePath("/recetas");
  revalidatePath("/menu-semanal");
}

export async function deleteRecipe(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.recipe.delete({ where: { id } });
  revalidatePath("/recetas");
  revalidatePath("/menu-semanal");
}

// Agrega a la lista de compra lo que le falta a una receta para poder cocinarla.
export async function addMissingIngredientsToShoppingList(recipeId: string) {
  const recommendations = await getRecipeRecommendations();
  const recipe = recommendations.find((r) => r.id === recipeId);
  if (!recipe) throw new Error("Receta no encontrada");

  for (const item of recipe.missing) {
    await prisma.shoppingListItem.create({
      data: { productId: item.productId, quantity: item.needed },
    });
  }

  revalidatePath("/lista-compra");
  revalidatePath("/recetas");
}

export async function listAllRecipes() {
  return prisma.recipe.findMany({
    include: { ingredients: { include: { product: true } } },
    orderBy: { name: "asc" },
  });
}
