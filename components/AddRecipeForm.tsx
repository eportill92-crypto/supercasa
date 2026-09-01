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
        setMessage("Receta guardada. 🎉");
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
          className="input sm:col-span-2"
        />
        <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="input">
          {MEAL_TYPES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-ink-soft">Porciones</label>
        <input
          type="number"
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          className="input w-20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-ink">Ingredientes (para esas porciones)</p>
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={row.productName}
              onChange={(e) => updateRow(index, { productName: e.target.value })}
              placeholder="Producto (ej. Jitomate)"
              className="input flex-1"
            />
            <input
              type="number"
              step="0.05"
              value={row.quantity}
              onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
              className="input w-20"
            />
            <input
              value={row.unit}
              onChange={(e) => updateRow(index, { unit: e.target.value })}
              placeholder="unidad"
              className="input w-20"
            />
            <button type="button" onClick={() => removeRow(index)} className="text-xs font-semibold text-ink-soft hover:text-berry-text">
              Quitar
            </button>
          </div>
        ))}
        <button type="button" onClick={addRow} className="btn-ghost self-start !px-2">
          + Agregar ingrediente
        </button>
      </div>

      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Instrucciones (opcional)"
        rows={3}
        className="input"
      />

      <button type="button" disabled={isPending} onClick={submit} className="btn-primary self-start">
        {isPending ? "Guardando..." : "Guardar receta"}
      </button>

      {message && <p className="text-sm font-semibold text-mint-text">{message}</p>}
    </div>
  );
}
