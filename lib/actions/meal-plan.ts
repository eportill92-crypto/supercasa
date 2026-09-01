"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { addDays, type MealType } from "@/lib/date-utils";

export async function getWeekMealPlan(weekStart: Date) {
  const weekEnd = addDays(weekStart, 7);
  const entries = await prisma.mealPlanEntry.findMany({
    where: { date: { gte: weekStart, lt: weekEnd } },
    include: { recipe: true },
  });
  return entries;
}

export async function assignMeal(input: {
  date: string; // ISO date (yyyy-mm-dd)
  mealType: MealType;
  recipeId: string;
  servings: number;
}) {
  const date = new Date(`${input.date}T00:00:00.000Z`);

  const existing = await prisma.mealPlanEntry.findFirst({
    where: { date, mealType: input.mealType },
  });

  if (existing) {
    await prisma.mealPlanEntry.update({
      where: { id: existing.id },
      data: { recipeId: input.recipeId, servings: input.servings },
    });
  } else {
    await prisma.mealPlanEntry.create({
      data: { date, mealType: input.mealType, recipeId: input.recipeId, servings: input.servings },
    });
  }

  revalidatePath("/menu-semanal");
}

export async function removeMeal(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.mealPlanEntry.delete({ where: { id } });
  revalidatePath("/menu-semanal");
}

export type PrepareMealResult = { success: boolean; message: string };

// Marca una comida planeada como preparada y descuenta sus ingredientes del inventario,
// escalados según las porciones reales contra las porciones base de la receta.
export async function prepareMeal(entryId: string): Promise<PrepareMealResult> {
  try {
    const entry = await prisma.mealPlanEntry.findUnique({
      where: { id: entryId },
      include: { recipe: { include: { ingredients: true } } },
    });
    if (!entry) return { success: false, message: "Comida no encontrada" };
    if (entry.prepared) return { success: false, message: "Ya estaba marcada como preparada" };

    const scale = entry.servings / entry.recipe.servings;

    for (const ing of entry.recipe.ingredients) {
      const scaledQty = Math.round(ing.quantity * scale * 100) / 100;
      const pantryItem = await prisma.pantryItem.findUnique({ where: { productId: ing.productId } });

      if (pantryItem) {
        await prisma.pantryItem.update({
          where: { productId: ing.productId },
          data: { quantity: Math.max(0, pantryItem.quantity - scaledQty) },
        });
      }

      await prisma.usageEvent.create({
        data: {
          productId: ing.productId,
          quantity: scaledQty,
          note: `Receta: ${entry.recipe.name}`,
        },
      });
    }

    await prisma.mealPlanEntry.update({
      where: { id: entryId },
      data: { prepared: true, preparedAt: new Date() },
    });
    await prisma.recipe.update({
      where: { id: entry.recipeId },
      data: { timesUsed: { increment: 1 } },
    });

    revalidatePath("/menu-semanal");
    revalidatePath("/inventario");
    revalidatePath("/lista-compra");
    revalidatePath("/recetas");
    revalidatePath("/");

    return { success: true, message: "Comida preparada, inventario actualizado." };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Error inesperado: ${message}` };
  }
}
