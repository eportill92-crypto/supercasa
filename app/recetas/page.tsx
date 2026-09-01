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
        <h1 className="text-3xl font-extrabold">🍳 Recetas</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Ordenadas para cocinar con lo que ya tienes: primero tus recetas y las que ya has
          preparado, luego las que más se acercan a tu inventario actual.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        {recipes.map((r) => {
          const complete = r.totalCount > 0 && r.haveCount === r.totalCount;
          return (
            <div key={r.id} className="card !p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{r.name}</span>
                  {r.mealType && <span className="badge-grape">{MEAL_LABELS[r.mealType] ?? r.mealType}</span>}
                  {r.source === "user" && <span className="badge-mint">Tuya</span>}
                  {r.timesUsedByMe > 0 && (
                    <span className="text-xs text-ink-soft">
                      La preparaste {r.timesUsedByMe} {r.timesUsedByMe === 1 ? "vez" : "veces"}
                    </span>
                  )}
                </div>
                <span className={complete ? "badge-mint" : "badge-sun"}>
                  {r.haveCount}/{r.totalCount} ingredientes
                </span>
              </div>

              {r.instructions && <p className="mt-2 text-sm text-ink-soft">{r.instructions}</p>}

              {r.missing.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-ink-soft">
                    Te falta: {r.missing.map((m) => `${m.name} (${m.needed} ${m.unit})`).join(", ")}
                  </p>
                  <div className="mt-2">
                    <AddMissingButton recipeId={r.id} />
                  </div>
                </div>
              )}

              {r.source === "user" && (
                <form action={deleteRecipe} className="mt-2">
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="text-xs font-semibold text-ink-soft hover:text-berry-text">
                    Eliminar receta
                  </button>
                </form>
              )}
            </div>
          );
        })}
        {recipes.length === 0 && <p className="text-sm text-ink-soft">Aún no hay recetas.</p>}
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-bold text-brand-text">
          <span>👩‍🍳</span> Agregar tu propia receta
        </h2>
        <div className="mt-4">
          <AddRecipeForm />
        </div>
      </section>
    </div>
  );
}
