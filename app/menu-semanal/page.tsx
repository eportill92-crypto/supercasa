export const dynamic = "force-dynamic";

import Link from "next/link";
import { getWeekMealPlan } from "@/lib/actions/meal-plan";
import { getMonday, addDays, MEAL_TYPES } from "@/lib/date-utils";
import { listAllRecipes } from "@/lib/actions/recipes";
import MealPlanGrid from "@/components/MealPlanGrid";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function MenuSemanalPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const baseDate = params.week ? new Date(`${params.week}T00:00:00.000Z`) : new Date();
  const weekStart = getMonday(baseDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = addDays(weekStart, 6);

  const [entries, recipes] = await Promise.all([getWeekMealPlan(weekStart), listAllRecipes()]);

  const prevWeek = isoDate(addDays(weekStart, -7));
  const nextWeek = isoDate(addDays(weekStart, 7));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Menú semanal</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Asigna una receta a cada comida y márcala como preparada cuando la cocines: el
          inventario se descuenta solo.
        </p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link href={`/menu-semanal?week=${prevWeek}`} className="text-zinc-500 hover:underline">
          ← Semana anterior
        </Link>
        <span className="font-medium">
          {weekStart.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} –{" "}
          {weekEnd.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
        </span>
        <Link href={`/menu-semanal?week=${nextWeek}`} className="text-zinc-500 hover:underline">
          Semana siguiente →
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Aún no hay recetas. Agrega una en{" "}
          <Link href="/recetas" className="underline">
            Recetas
          </Link>
          .
        </p>
      ) : (
        <MealPlanGrid
          weekDays={weekDays}
          entries={entries}
          recipes={recipes.map((r) => ({ id: r.id, name: r.name, servings: r.servings }))}
          mealTypes={MEAL_TYPES}
        />
      )}
    </div>
  );
}
