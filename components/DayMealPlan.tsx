"use client";

import { useState, useTransition } from "react";
import { assignMeal, prepareMeal } from "@/lib/actions/meal-plan";
import type { MealType } from "@/lib/date-utils";

type RecipeOption = { id: string; name: string; servings: number };
type Entry = {
  id: string;
  date: Date;
  mealType: string;
  recipeId: string;
  servings: number;
  prepared: boolean;
  recipe: { name: string };
};

const MEAL_LABELS: Record<MealType, string> = {
  desayuno: "Desayuno",
  comida: "Comida",
  cena: "Cena",
  snack: "Snack",
};
const MEAL_ICONS: Record<MealType, string> = { desayuno: "🌅", comida: "🍲", cena: "🌙", snack: "🍪" };

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function DayMealPlan({
  day,
  entries,
  recipes,
  mealTypes,
}: {
  day: Date;
  entries: Entry[];
  recipes: RecipeOption[];
  mealTypes: readonly MealType[];
}) {
  const [editing, setEditing] = useState<MealType | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function entryFor(mealType: MealType) {
    const iso = isoDate(day);
    return entries.find((e) => isoDate(e.date) === iso && e.mealType === mealType);
  }

  function onAssign(mealType: MealType, recipeId: string, servings: number) {
    startTransition(async () => {
      await assignMeal({ date: isoDate(day), mealType, recipeId, servings });
      setEditing(null);
    });
  }

  function onPrepare(entryId: string) {
    setMessage(null);
    startTransition(async () => {
      const res = await prepareMeal(entryId);
      setMessage(res.message);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {mealTypes.map((mealType) => {
        const entry = entryFor(mealType);
        return (
          <div key={mealType} className="card flex items-center gap-3 !p-4">
            <span className="text-xl">{MEAL_ICONS[mealType]}</span>
            <div className="flex-1">
              <div className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{MEAL_LABELS[mealType]}</div>
              {entry ? (
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-sm font-bold">{entry.recipe.name}</span>
                  <span className="text-xs text-ink-soft">{entry.servings} 👤</span>
                </div>
              ) : editing === mealType ? (
                <AssignForm
                  recipes={recipes}
                  onCancel={() => setEditing(null)}
                  onSubmit={(recipeId, servings) => onAssign(mealType, recipeId, servings)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(mealType)}
                  className="mt-0.5 text-sm font-bold text-mint-text"
                >
                  + Elegir receta
                </button>
              )}
            </div>
            {entry &&
              (entry.prepared ? (
                <span className="badge-mint">✔ Preparada</span>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => onPrepare(entry.id)}
                  className="rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-white transition hover:bg-mint-dark disabled:opacity-50"
                >
                  Preparar
                </button>
              ))}
          </div>
        );
      })}
      {message && <p className="text-sm font-semibold text-mint-text">{message}</p>}
    </div>
  );
}

function AssignForm({
  recipes,
  onSubmit,
  onCancel,
}: {
  recipes: RecipeOption[];
  onSubmit: (recipeId: string, servings: number) => void;
  onCancel: () => void;
}) {
  const [recipeId, setRecipeId] = useState(recipes[0]?.id ?? "");
  const [servings, setServings] = useState(recipes[0]?.servings ?? 4);

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      <select
        value={recipeId}
        onChange={(e) => {
          setRecipeId(e.target.value);
          const r = recipes.find((r) => r.id === e.target.value);
          if (r) setServings(r.servings);
        }}
        className="rounded-lg border-2 border-black/10 px-1.5 py-1 text-xs"
      >
        {recipes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={servings}
        onChange={(e) => setServings(Number(e.target.value))}
        className="w-14 rounded-lg border-2 border-black/10 px-1.5 py-1 text-xs"
      />
      <button
        type="button"
        onClick={() => recipeId && onSubmit(recipeId, servings)}
        className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white hover:bg-brand-dark"
      >
        Guardar
      </button>
      <button type="button" onClick={onCancel} className="text-xs font-semibold text-ink-soft">
        Cancelar
      </button>
    </div>
  );
}
