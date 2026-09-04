"use client";

import { useRef, useState, useTransition } from "react";
import { addRecipe } from "@/lib/actions/recipes";
import { createRecipeCategory } from "@/lib/actions/categories";
import {
  extractRecipeFromImage,
  extractRecipeFromPdf,
  extractRecipeFromLink,
  type ExtractedRecipe,
} from "@/lib/actions/recipe-extraction";

type IngredientRow = { productName: string; unit: string; quantity: number };
type RecipeCategoryOption = { id: string; name: string; emoji: string };

const MEAL_TYPES = [
  { value: "desayuno", label: "Desayuno" },
  { value: "comida", label: "Comida" },
  { value: "cena", label: "Cena" },
  { value: "snack", label: "Snack" },
];

export default function AddRecipeForm({ categories }: { categories: RecipeCategoryOption[] }) {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState("comida");
  const [recipeCategoryId, setRecipeCategoryId] = useState(categories[0]?.id ?? "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [servings, setServings] = useState(4);
  const [instructions, setInstructions] = useState("");
  const [rows, setRows] = useState<IngredientRow[]>([{ productName: "", unit: "pza", quantity: 1 }]);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isExtracting, startExtractTransition] = useTransition();
  const [extractMessage, setExtractMessage] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  function applyExtracted(extracted: ExtractedRecipe) {
    setName(extracted.name);
    setServings(extracted.servings);
    setInstructions(extracted.instructions);
    setRows(
      extracted.ingredients.map((i) => ({ productName: i.name, unit: i.unit, quantity: i.quantity }))
    );
    const matched = categories.find((c) => c.name.toLowerCase() === extracted.suggestedCategory.toLowerCase());
    if (matched) {
      setRecipeCategoryId(matched.id);
      setShowNewCategory(false);
    }
    setExtractMessage(`Detectamos "${extracted.name}" — revísala antes de guardar. 👇`);
  }

  function handleFileExtract(file: File | undefined, kind: "image" | "pdf") {
    if (!file) return;
    setExtractMessage(null);
    startExtractTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("file", file);
        const extracted = await (kind === "image" ? extractRecipeFromImage(fd) : extractRecipeFromPdf(fd));
        applyExtracted(extracted);
      } catch (err) {
        setExtractMessage(err instanceof Error ? err.message : "No se pudo leer la receta");
      }
    });
  }

  function handleLinkExtract() {
    if (!linkUrl.trim()) return;
    setExtractMessage(null);
    startExtractTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("url", linkUrl.trim());
        const extracted = await extractRecipeFromLink(fd);
        applyExtracted(extracted);
        setLinkUrl("");
        setShowLinkInput(false);
      } catch (err) {
        setExtractMessage(err instanceof Error ? err.message : "No se pudo leer la receta");
      }
    });
  }

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
        let categoryId = recipeCategoryId;
        if (showNewCategory && newCategoryName.trim()) {
          const fd = new FormData();
          fd.set("name", newCategoryName.trim());
          const created = await createRecipeCategory(fd);
          categoryId = created.id;
        }

        await addRecipe({
          name,
          mealType,
          recipeCategoryId: categoryId || undefined,
          servings,
          instructions,
          ingredients: rows,
        });
        setMessage("Receta guardada. 🎉");
        setName("");
        setInstructions("");
        setRows([{ productName: "", unit: "pza", quantity: 1 }]);
        setShowNewCategory(false);
        setNewCategoryName("");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Error al guardar la receta");
      }
    });
  }

  return (
    <div id="agregar-receta" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileExtract(e.target.files?.[0], "image")}
        />
        <button
          type="button"
          disabled={isExtracting}
          onClick={() => photoInputRef.current?.click()}
          className="btn-secondary"
        >
          📷 Foto
        </button>

        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFileExtract(e.target.files?.[0], "pdf")}
        />
        <button
          type="button"
          disabled={isExtracting}
          onClick={() => pdfInputRef.current?.click()}
          className="btn-secondary"
        >
          📄 PDF
        </button>

        <button
          type="button"
          disabled={isExtracting}
          onClick={() => setShowLinkInput((v) => !v)}
          className="btn-secondary"
        >
          🔗 Link
        </button>

        {isExtracting && <span className="text-xs font-semibold text-brand-text">Leyendo la receta…</span>}
      </div>

      {showLinkInput && (
        <div className="flex gap-2">
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLinkExtract()}
            placeholder="Pega el link de la receta"
            className="input flex-1"
          />
          <button type="button" disabled={isExtracting} onClick={handleLinkExtract} className="btn-primary">
            Leer
          </button>
        </div>
      )}

      {extractMessage && <p className="text-sm font-semibold text-mint-text">{extractMessage}</p>}

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

      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-ink-soft">Categoría</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setRecipeCategoryId(cat.id);
                setShowNewCategory(false);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                !showNewCategory && recipeCategoryId === cat.id
                  ? "bg-mint text-white"
                  : "border-2 border-black/10 bg-white text-ink"
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowNewCategory(true)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              showNewCategory ? "bg-mint text-white" : "bg-mint-light text-mint-text"
            }`}
          >
            + Nueva categoría
          </button>
        </div>
        {showNewCategory && (
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder='Ej. "Cenas light"'
            className="input mt-2"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-ink-soft">Porciones</label>
        <input
          type="number"
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          className="input w-20"
        />
        <span className="text-xs text-ink-soft">las escalamos solas al usarla en tu semana</span>
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

      <button type="button" disabled={isPending || !name.trim()} onClick={submit} className="btn-primary self-start">
        {isPending ? "Guardando..." : "Guardar receta"}
      </button>

      {message && <p className="text-sm font-semibold text-mint-text">{message}</p>}
    </div>
  );
}
