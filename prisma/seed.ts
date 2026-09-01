import { PrismaClient } from "@prisma/client";
import { RECIPE_SEEDS } from "./recipe-seeds";

const prisma = new PrismaClient();

// Cada usuario nuevo empieza con su despensa vacía (multi-usuario: no tiene sentido sembrar
// productos "de ejemplo" para cuentas que no existen todavía). Lo único que se siembra es el
// recetario base, compartido (Recipe.userId = null) y visible para todos los usuarios.
async function main() {
  await seedRecipes();
}

async function seedRecipes() {
  for (const recipe of RECIPE_SEEDS) {
    const existing = await prisma.recipe.findFirst({
      where: { name: recipe.name, source: "seed" },
    });
    if (existing) continue;

    await prisma.recipe.create({
      data: {
        userId: null,
        name: recipe.name,
        source: "seed",
        mealType: recipe.mealType,
        servings: recipe.servings,
        instructions: recipe.instructions,
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
