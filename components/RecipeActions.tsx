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
      className="btn-secondary !px-3 !py-1.5 text-xs"
    >
      {isPending ? "Agregando..." : "🛒 Agregar faltantes a la lista"}
    </button>
  );
}
