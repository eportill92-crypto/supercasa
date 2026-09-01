"use client";

import { useTransition } from "react";
import { addMissingIngredientsToShoppingList } from "@/lib/actions/recipes";

export default function AddMissingButton({ recipeId }: { recipeId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => addMissingIngredientsToShoppingList(recipeId))}
      className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
    >
      {isPending ? "Agregando..." : "Agregar faltantes a la lista"}
    </button>
  );
}
