"use client";

import { useState, useTransition } from "react";
import { addRecipe } from "@/lib/actions/recipes";

type IngredientRow = { productName: string; unit: string; quantity: number };

const MEAL_TYPES = [
  { value: "desayuno", label: "Desayuno" },
  { value: "comida", label: "Comida" },
  { value: "cena", label: "Cena" },
  { value: "snack", label: "Snack" },
];

export default function AddRecipeForm() {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState("comida");
  const [servings, setServings] = useState(4);
  const [instructions, setInstructions] = useState("");
  const [rows, setRows] = useState<IngredientRow[]>([{ productName: "", unit: "pza", quantity: 1 }]);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function updateRow(index: number, patch: Partial<IngredientRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { productName: "", unit: "pza", quantity: 1 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function submit() {
    setMessage(null);
    startTransition(async () => {
      try {
        await addRecipe({
          name,
          mealType,
          servings,
          instructions,
          ingredients: rows,
        });
        setMessage("Receta guardada.");
        setName("");
        setInstructions("");
        setRows([{ productName: "", unit: "pza", quantity: 1 }]);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Error al guardar la receta");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la receta"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          {MEAL_TYPES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-zinc-500">Porciones</label>
        <input
          type="number"
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-zinc-700">Ingredientes (para esas porciones)</p>
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={row.productName}
              onChange={(e) => updateRow(index, { productName: e.target.value })}
              placeholder="Producto (ej. Jitomate)"
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="0.05"
              value={row.quantity}
              onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
              className="w-20 rounded-md border border-zinc-300 px-2 py-2 text-sm"
            />
            <input
              value={row.unit}
              onChange={(e) => updateRow(index, { unit: e.target.value })}
              placeholder="unidad"
              className="w-20 rounded-md border border-zinc-300 px-2 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="text-xs text-zinc-400 hover:text-red-600"
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="self-start rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
        >
          + Agregar ingrediente
        </button>
      </div>

      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Instrucciones (opcional)"
        rows={3}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      <button
        type="button"
        disabled={isPending}
        onClick={submit}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar receta"}
      </button>

      {message && <p className="text-sm text-emerald-600">{message}</p>}
    </div>
  );
}
