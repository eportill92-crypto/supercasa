export const dynamic = "force-dynamic";

import { getRecipeRecommendations, deleteRecipe } from "@/lib/actions/recipes";
import AddRecipeForm from "@/components/AddRecipeForm";
import AddMissingButton from "@/components/RecipeActions";

const MEAL_LABELS: Record<string, string> = {
  desayuno: "Desayuno",
  comida: "Comida",
  cena: "Cena",
  snack: "Snack",
};

export default async function RecetasPage() {
  const recipes = await getRecipeRecommendations();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Recetas</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ordenadas para cocinar con lo que ya tienes: primero tus recetas y las que ya has
          preparado, luego las que más se acercan a tu inventario actual.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        {recipes.map((r) => {
          const complete = r.totalCount > 0 && r.haveCount === r.totalCount;
          return (
            <div key={r.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{r.name}</span>
                  {r.mealType && (
                    <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {MEAL_LABELS[r.mealType] ?? r.mealType}
                    </span>
                  )}
                  {r.source === "user" && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      Tuya
                    </span>
                  )}
                  {r.timesUsedByMe > 0 && (
                    <span className="ml-2 text-xs text-zinc-400">
                      La preparaste {r.timesUsedByMe} {r.timesUsedByMe === 1 ? "vez" : "veces"}
                    </span>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {r.haveCount}/{r.totalCount} ingredientes
                </span>
              </div>

              {r.instructions && <p className="mt-2 text-sm text-zinc-600">{r.instructions}</p>}

              {r.missing.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-zinc-400">
                    Te falta:{" "}
                    {r.missing.map((m) => `${m.name} (${m.needed} ${m.unit})`).join(", ")}
                  </p>
                  <div className="mt-2">
                    <AddMissingButton recipeId={r.id} />
                  </div>
                </div>
              )}

              {r.source === "user" && (
                <form action={deleteRecipe} className="mt-2">
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="text-xs text-zinc-400 hover:text-red-600">
                    Eliminar receta
                  </button>
                </form>
              )}
            </div>
          );
        })}
        {recipes.length === 0 && (
          <p className="text-sm text-zinc-400">Aún no hay recetas.</p>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-medium">Agregar tu propia receta</h2>
        <div className="mt-4">
          <AddRecipeForm />
        </div>
      </section>
    </div>
  );
}
