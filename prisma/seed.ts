import { PrismaClient } from "@prisma/client";
import { RECIPE_SEEDS } from "./recipe-seeds";
import {
  DEFAULT_PRODUCT_CATEGORIES,
  DEFAULT_RECIPE_CATEGORIES,
  MEAL_TYPE_TO_RECIPE_CATEGORY,
  PRODUCT_CATEGORY_ALIASES,
} from "./category-seeds";

const prisma = new PrismaClient();

// Cada usuario nuevo empieza con su despensa vacía (multi-usuario: no tiene sentido sembrar
// productos "de ejemplo" para cuentas que no existen todavía). Lo que se siembra es el
// recetario base (Recipe.userId = null) y las categorías default (ProductCategory/RecipeCategory
// con userId = null), ambos compartidos y visibles para todos los usuarios.
async function main() {
  await seedProductCategories();
  const recipeCategoryByName = await seedRecipeCategories();
  await seedRecipes(recipeCategoryByName);
  await backfillProductCategories();
}

// No usamos upsert por el índice único compuesto [userId, name]: en Postgres un índice único
// no considera iguales dos NULL, así que con userId = null (categorías default) upsert insertaría
// un duplicado en cada corrida en vez de encontrar la fila existente. findFirst + create evita eso.
async function seedProductCategories() {
  for (const cat of DEFAULT_PRODUCT_CATEGORIES) {
    const existing = await prisma.productCategory.findFirst({ where: { userId: null, name: cat.name } });
    if (existing) {
      await prisma.productCategory.update({ where: { id: existing.id }, data: { emoji: cat.emoji, sortOrder: cat.sortOrder } });
    } else {
      await prisma.productCategory.create({ data: { userId: null, name: cat.name, emoji: cat.emoji, sortOrder: cat.sortOrder } });
    }
  }
  console.log(`Sembradas ${DEFAULT_PRODUCT_CATEGORIES.length} categorías de producto default.`);
}

async function seedRecipeCategories() {
  const byName = new Map<string, string>();
  for (const cat of DEFAULT_RECIPE_CATEGORIES) {
    const existing = await prisma.recipeCategory.findFirst({ where: { userId: null, name: cat.name } });
    const row = existing
      ? await prisma.recipeCategory.update({ where: { id: existing.id }, data: { emoji: cat.emoji, sortOrder: cat.sortOrder } })
      : await prisma.recipeCategory.create({ data: { userId: null, name: cat.name, emoji: cat.emoji, sortOrder: cat.sortOrder } });
    byName.set(cat.name, row.id);
  }
  console.log(`Sembradas ${DEFAULT_RECIPE_CATEGORIES.length} categorías de receta default.`);
  return byName;
}

async function seedRecipes(recipeCategoryByName: Map<string, string>) {
  for (const recipe of RECIPE_SEEDS) {
    const categoryName = recipe.mealType ? MEAL_TYPE_TO_RECIPE_CATEGORY[recipe.mealType] : undefined;
    const recipeCategoryId = categoryName ? recipeCategoryByName.get(categoryName) : undefined;

    const existing = await prisma.recipe.findFirst({
      where: { name: recipe.name, source: "seed" },
    });
    if (existing) {
      if (recipeCategoryId && !existing.recipeCategoryId) {
        await prisma.recipe.update({ where: { id: existing.id }, data: { recipeCategoryId } });
      }
      continue;
    }

    await prisma.recipe.create({
      data: {
        userId: null,
        name: recipe.name,
        source: "seed",
        mealType: recipe.mealType,
        servings: recipe.servings,
        instructions: recipe.instructions,
        recipeCategoryId,
        ingredients: {
          create: recipe.ingredients.map((ing) => ({
            name: ing.product,
            unit: ing.unit,
            quantity: ing.quantity,
          })),
        },
      },
    });
  }

  console.log(`Sembradas ${RECIPE_SEEDS.length} recetas base.`);
}

// Los productos que los usuarios ya tenían en su despensa (antes de que existiera
// ProductCategory) solo tienen el campo de texto libre `category`. Este backfill, no
// destructivo, intenta emparejarlo contra las categorías default y solo llena
// `productCategoryId` cuando encuentra un alias claro — nunca borra ni cambia el texto legado.
async function backfillProductCategories() {
  const uncategorized = await prisma.product.findMany({
    where: { productCategoryId: null, category: { not: null } },
  });
  if (uncategorized.length === 0) return;

  const categories = await prisma.productCategory.findMany({ where: { userId: null } });
  const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

  let matched = 0;
  for (const product of uncategorized) {
    const key = (product.category ?? "").trim().toLowerCase();
    const normalizedName = PRODUCT_CATEGORY_ALIASES[key];
    const categoryId = normalizedName ? categoryIdByName.get(normalizedName) : undefined;
    if (!categoryId) continue;
    await prisma.product.update({ where: { id: product.id }, data: { productCategoryId: categoryId } });
    matched += 1;
  }
  console.log(`Backfill de categoría: ${matched}/${uncategorized.length} productos emparejados por alias.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
