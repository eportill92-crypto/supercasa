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

const MEAL_ICONS: Record<MealType, string> = {
  desayuno: "🌅",
  comida: "🍲",
  cena: "🌙",
  snack: "🍎",
};

const MEAL_BADGE: Record<MealType, string> = {
  desayuno: "badge-sun",
  comida: "badge-mint",
  cena: "badge-grape",
  snack: "badge-berry",
};

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function MealPlanGrid({
  weekDays,
  entries,
  recipes,
  mealTypes,
}: {
  weekDays: Date[];
  entries: Entry[];
  recipes: RecipeOption[];
  mealTypes: readonly MealType[];
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function entryFor(date: Date, mealType: MealType) {
    const iso = isoDate(date);
    return entries.find((e) => isoDate(e.date) === iso && e.mealType === mealType);
  }

  function onAssign(date: Date, mealType: MealType, recipeId: string, servings: number) {
    startTransition(async () => {
      await assignMeal({ date: isoDate(date), mealType, recipeId, servings });
      setEditingKey(null);
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
      <div className="card overflow-x-auto !p-3">
        <table className="w-full border-separate border-spacing-2 text-sm">
          <thead>
            <tr>
              <th className="w-20" />
              {weekDays.map((d, i) => (
                <th key={i} className="text-left text-xs font-bold text-ink-soft">
                  {DAY_LABELS[i]} {d.getUTCDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypes.map((mealType) => (
              <tr key={mealType}>
                <td className="align-top">
                  <span className={MEAL_BADGE[mealType]}>
                    {MEAL_ICONS[mealType]} {MEAL_LABELS[mealType]}
                  </span>
                </td>
                {weekDays.map((day, i) => {
                  const key = `${isoDate(day)}-${mealType}`;
                  const entry = entryFor(day, mealType);
                  const editing = editingKey === key;

                  return (
                    <td
                      key={i}
                      className="min-w-[140px] rounded-2xl border border-black/5 bg-cream/60 p-2 align-top"
                    >
                      {editing ? (
                        <AssignForm
                          recipes={recipes}
                          initialRecipeId={entry?.recipeId}
                          initialServings={entry?.servings}
                          onCancel={() => setEditingKey(null)}
                          onSubmit={(recipeId, servings) => onAssign(day, mealType, recipeId, servings)}
                        />
                      ) : entry ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-ink">{entry.recipe.name}</span>
                          <span className="text-xs text-ink-soft">{entry.servings} porciones</span>
                          {entry.prepared ? (
                            <span className="badge-mint mt-1 w-fit">✔ Preparada</span>
                          ) : (
                            <div className="mt-1 flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => onPrepare(entry.id)}
                                className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-white transition hover:bg-mint-dark disabled:opacity-50"
                              >
                                Preparar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingKey(key)}
                                className="text-xs font-semibold text-ink-soft hover:text-brand"
                              >
                                Editar
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingKey(key)}
                          className="text-xs font-semibold text-ink-soft hover:text-brand"
                        >
                          + Asignar
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    <div className="flex flex-col gap-1">
      <select
        value={recipeId}
        onChange={(e) => {
          setRecipeId(e.target.value);
          const r = recipes.find((r) => r.id === e.target.value);
          if (r) setServings(r.servings);
        }}
        className="w-full rounded-lg border-2 border-black/10 px-1 py-1 text-xs"
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
        className="w-full rounded-lg border-2 border-black/10 px-1 py-1 text-xs"
      />
      <div className="flex gap-1">
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
    </div>
  );
}
