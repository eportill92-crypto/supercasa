"use client";

import { useState, useTransition } from "react";
import { searchRecipesByIngredients } from "@/lib/actions/recipes";

type Result = { id: string; name: string; servings: number; totalCount: number; missing: string[] };

export default function IngredientSearch() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [isPending, startTransition] = useTransition();

  function search() {
    if (!text.trim()) return;
    startTransition(async () => {
      setResults(await searchRecipesByIngredients(text));
    });
  }

  return (
    <div className="card">
      <h2 className="flex items-center gap-2 font-bold text-brand-text">
        <span>🥚</span> ¿Qué puedo cocinar?
      </h2>
      <p className="mt-1 text-xs text-ink-soft">Dinos qué tienes y te decimos qué recetas te alcanzan.</p>
      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Tengo: huevo, leche, jitomate…"
          className="input flex-1"
        />
        <button type="button" disabled={isPending} onClick={search} className="btn-secondary">
          Buscar
        </button>
      </div>

      {results && (
        <div className="mt-3 flex flex-col gap-2">
          {results.length === 0 ? (
            <p className="text-sm text-ink-soft">Con eso no encontramos ninguna receta que te alcance.</p>
          ) : (
            results.slice(0, 6).map((r) => (
              <div key={r.id} className="rounded-2xl bg-mint-light px-4 py-2.5 text-sm text-mint-text">
                {r.missing.length === 0 ? (
                  <>
                    ✅ Con eso puedes hacer <b>{r.name}</b>.
                  </>
                ) : (
                  <>
                    Para <b>{r.name}</b> solo te falta: {r.missing.join(", ")}.
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
