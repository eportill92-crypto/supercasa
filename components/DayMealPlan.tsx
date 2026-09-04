"use client";

import { useState, useTransition } from "react";
import { addMeal, updateMealEntry, removeMeal, prepareMeal } from "@/lib/actions/meal-plan";
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

type FormTarget = { mode: "add"; mealType: MealType } | { mode: "edit"; entry: Entry };

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
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function entriesFor(mealType: MealType) {
    const iso = isoDate(day);
    return entries.filter((e) => isoDate(e.date) === iso && e.mealType === mealType);
  }

  function onAdd(mealType: MealType, recipeId: string, servings: number) {
    startTransition(async () => {
      await addMeal({ date: isoDate(day), mealType, recipeId, servings });
      setFormTarget(null);
    });
  }

  function onUpdate(entryId: string, recipeId: string, servings: number) {
    startTransition(async () => {
      await updateMealEntry({ entryId, recipeId, servings });
      setFormTarget(null);
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
        const mealEntries = entriesFor(mealType);
        const isAdding = formTarget?.mode === "add" && formTarget.mealType === mealType;

        return (
          <div key={mealType} className="card flex flex-col gap-2 !p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{MEAL_ICONS[mealType]}</span>
              <span className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">
                {MEAL_LABELS[mealType]}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {mealEntries.map((entry) =>
                formTarget?.mode === "edit" && formTarget.entry.id === entry.id ? (
                  <AssignForm
                    key={entry.id}
                    recipes={recipes}
                    initialRecipeId={entry.recipeId}
                    initialServings={entry.servings}
                    onCancel={() => setFormTarget(null)}
                    onSubmit={(recipeId, servings) => onUpdate(entry.id, recipeId, servings)}
                  />
                ) : (
                  <div key={entry.id} className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">{entry.recipe.name}</span>
                    <span className="text-xs text-ink-soft">{entry.servings} 👤</span>
                    {entry.prepared ? (
                      <span className="badge-mint">✔ Preparada</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setFormTarget({ mode: "edit", entry })}
                          className="text-xs font-semibold text-brand-text underline"
                        >
                          Editar
                        </button>
                        <form action={removeMeal}>
                          <input type="hidden" name="id" value={entry.id} />
                          <button type="submit" className="text-xs font-semibold text-ink-soft hover:text-berry-text">
                            Quitar
                          </button>
                        </form>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => onPrepare(entry.id)}
                          className="ml-auto rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-white transition hover:bg-mint-dark disabled:opacity-50"
                        >
                          Preparar
                        </button>
                      </>
                    )}
                  </div>
                )
              )}

              {isAdding ? (
                <AssignForm
                  recipes={recipes}
                  onCancel={() => setFormTarget(null)}
                  onSubmit={(recipeId, servings) => onAdd(mealType, recipeId, servings)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setFormTarget({ mode: "add", mealType })}
                  className="flex items-center gap-1 self-start text-sm font-bold text-mint-text"
                >
                  <span aria-hidden>+</span> Agregar platillo
                </button>
              )}
            </div>
          </div>
        );
      })}
      {message && <p className="text-sm font-semibold text-mint-text">{message}</p>}
    </div>
  );
}

function AssignForm({
  recipes,
  initialRecipeId,
  initialServings,
  onSubmit,
  onCancel,
}: {
  recipes: RecipeOption[];
  initialRecipeId?: string;
  initialServings?: number;
  onSubmit: (recipeId: string, servings: number) => void;
  onCancel: () => void;
}) {
  const [recipeId, setRecipeId] = useState(initialRecipeId ?? recipes[0]?.id ?? "");
  const [servings, setServings] = useState(initialServings ?? recipes[0]?.servings ?? 4);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
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
