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
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-2 text-sm">
          <thead>
            <tr>
              <th className="w-20" />
              {weekDays.map((d, i) => (
                <th key={i} className="text-left text-xs font-medium text-zinc-500">
                  {DAY_LABELS[i]} {d.getUTCDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypes.map((mealType) => (
              <tr key={mealType}>
                <td className="align-top text-xs font-medium text-zinc-500">
                  {MEAL_LABELS[mealType]}
                </td>
                {weekDays.map((day, i) => {
                  const key = `${isoDate(day)}-${mealType}`;
                  const entry = entryFor(day, mealType);
                  const editing = editingKey === key;

                  return (
                    <td key={i} className="min-w-[140px] align-top rounded-md border border-zinc-200 bg-white p-2">
                      {entry ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-zinc-800">
                            {entry.recipe.name}
                          </span>
                          <span className="text-xs text-zinc-400">{entry.servings} porciones</span>
                          {entry.prepared ? (
                            <span className="text-xs font-medium text-emerald-600">✔ Preparada</span>
                          ) : (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => onPrepare(entry.id)}
                              className="mt-1 rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                            >
                              Preparar
                            </button>
                          )}
                        </div>
                      ) : editing ? (
                        <AssignForm
                          recipes={recipes}
                          onCancel={() => setEditingKey(null)}
                          onSubmit={(recipeId, servings) => onAssign(day, mealType, recipeId, servings)}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingKey(key)}
                          className="text-xs text-zinc-400 hover:text-zinc-700"
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
      {message && <p className="text-sm text-zinc-600">{message}</p>}
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
    <div className="flex flex-col gap-1">
      <select
        value={recipeId}
        onChange={(e) => {
          setRecipeId(e.target.value);
          const r = recipes.find((r) => r.id === e.target.value);
          if (r) setServings(r.servings);
        }}
        className="w-full rounded-md border border-zinc-300 px-1 py-1 text-xs"
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
        className="w-full rounded-md border border-zinc-300 px-1 py-1 text-xs"
      />
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => recipeId && onSubmit(recipeId, servings)}
          className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-white hover:bg-zinc-700"
        >
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-zinc-400">
          Cancelar
        </button>
      </div>
    </div>
  );
}
