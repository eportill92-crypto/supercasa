export const dynamic = "force-dynamic";

import Link from "next/link";
import { getWeekMealPlan } from "@/lib/actions/meal-plan";
import { getMonday, addDays, MEAL_TYPES } from "@/lib/date-utils";
import { listAllRecipes } from "@/lib/actions/recipes";
import { listRecipeCategories } from "@/lib/actions/categories";
import MealPlanGrid from "@/components/MealPlanGrid";
import DayMealPlan from "@/components/DayMealPlan";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const DAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

export default async function MenuSemanalPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; view?: string; day?: string; cat?: string }>;
}) {
  const params = await searchParams;
  const baseDate = params.week ? new Date(`${params.week}T00:00:00.000Z`) : new Date();
  const weekStart = getMonday(baseDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = addDays(weekStart, 6);
  const view = params.view === "dia" ? "dia" : "semana";
  const selectedDay = params.day ? new Date(`${params.day}T00:00:00.000Z`) : weekDays[0];

  const [entries, recipes, recipeCategories] = await Promise.all([
    getWeekMealPlan(weekStart),
    listAllRecipes(),
    listRecipeCategories(),
  ]);

  const prevWeek = isoDate(addDays(weekStart, -7));
  const nextWeek = isoDate(addDays(weekStart, 7));
  const filteredRecipes = params.cat ? recipes.filter((r) => r.recipeCategoryId === params.cat) : recipes;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">📅 Planear tu semana</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Asigna una receta a cada comida y márcala como preparada cuando la cocines: la
            despensa se descuenta sola.
          </p>
        </div>
        <div className="flex shrink-0 rounded-full bg-black/5 p-1 text-xs font-bold">
          <Link
            href={`/menu-semanal?week=${isoDate(weekStart)}&view=dia&day=${isoDate(selectedDay)}`}
            className={`rounded-full px-3 py-1.5 ${view === "dia" ? "bg-white shadow-sm" : "text-ink-soft"}`}
          >
            Por día
          </Link>
          <Link
            href={`/menu-semanal?week=${isoDate(weekStart)}&view=semana`}
            className={`rounded-full px-3 py-1.5 ${view === "semana" ? "bg-white shadow-sm" : "text-ink-soft"}`}
          >
            Semana
          </Link>
        </div>
      </div>

      <div className="card flex items-center justify-between !py-3 text-sm">
        <Link href={`/menu-semanal?week=${prevWeek}&view=${view}`} className="btn-ghost !px-3">
          ← Anterior
        </Link>
        <span className="font-bold text-brand-text">
          {weekStart.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} –{" "}
          {weekEnd.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
        </span>
        <Link href={`/menu-semanal?week=${nextWeek}&view=${view}`} className="btn-ghost !px-3">
          Siguiente →
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Aún no hay recetas. Agrega una en{" "}
          <Link href="/recetas" className="font-bold text-brand underline">
            Recetario
          </Link>
          .
        </p>
      ) : view === "dia" ? (
        <>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {weekDays.map((d, i) => {
              const active = isoDate(d) === isoDate(selectedDay);
              return (
                <Link
                  key={i}
                  href={`/menu-semanal?week=${isoDate(weekStart)}&view=dia&day=${isoDate(d)}`}
                  className={`flex w-12 shrink-0 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-xs font-bold ${
                    active ? "bg-mint text-white" : "border-2 border-black/10 bg-white text-ink"
                  }`}
                >
                  <span>{DAY_LABELS[i]}</span>
                  <span className="text-sm">{d.getUTCDate()}</span>
                </Link>
              );
            })}
          </div>
          <DayMealPlan
            day={selectedDay}
            entries={entries}
            recipes={recipes.map((r) => ({ id: r.id, name: r.name, servings: r.servings }))}
            mealTypes={MEAL_TYPES}
          />
        </>
      ) : (
        <MealPlanGrid
          weekDays={weekDays}
          entries={entries}
          recipes={recipes.map((r) => ({ id: r.id, name: r.name, servings: r.servings }))}
          mealTypes={MEAL_TYPES}
        />
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">Recetario</h2>
          <Link href="/recetas" className="text-xs font-bold text-mint-text">
            Ver todo →
          </Link>
        </div>
        <div className="mb-3 flex gap-2 overflow-x-auto">
          <Link
            href={`/menu-semanal?week=${isoDate(weekStart)}&view=${view}${view === "dia" ? `&day=${isoDate(selectedDay)}` : ""}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${!params.cat ? "bg-mint text-white" : "border-2 border-black/10 bg-white"}`}
          >
            Todas
          </Link>
          {recipeCategories.map((c) => (
            <Link
              key={c.id}
              href={`/menu-semanal?week=${isoDate(weekStart)}&view=${view}${view === "dia" ? `&day=${isoDate(selectedDay)}` : ""}&cat=${c.id}`}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${params.cat === c.id ? "bg-mint text-white" : "border-2 border-black/10 bg-white"}`}
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {filteredRecipes.slice(0, 10).map((r) => (
            <div key={r.id} className="card w-36 shrink-0 !p-3">
              <div className="text-xs font-bold">{r.name}</div>
              <span className={r.userId ? "badge-mint mt-1.5 inline-block" : "badge-sun mt-1.5 inline-block"}>
                {r.userId ? "Tuya" : "Base"}
              </span>
            </div>
          ))}
          {filteredRecipes.length === 0 && <p className="text-sm text-ink-soft">No hay recetas en esta categoría.</p>}
        </div>
      </section>

      <Link href="/lista-compra" className="card flex items-center gap-3 !p-4">
        <span className="text-xl">🧾</span>
        <div className="flex-1">
          <div className="text-sm font-bold">Ver lista de súper</div>
          <div className="text-xs text-ink-soft">
            Ahí puedes agregar higiene, limpieza y todo lo que no es comida.
          </div>
        </div>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
