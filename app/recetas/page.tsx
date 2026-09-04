export const dynamic = "force-dynamic";

import Link from "next/link";
import { getRecipeRecommendations, deleteRecipe } from "@/lib/actions/recipes";
import { listRecipeCategories } from "@/lib/actions/categories";
import AddRecipeForm from "@/components/AddRecipeForm";
import AddMissingButton from "@/components/RecipeActions";
import IngredientSearch from "@/components/IngredientSearch";

export default async function RecetasPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [recipes, categories] = await Promise.all([getRecipeRecommendations(), listRecipeCategories()]);

  const filtered = cat ? recipes.filter((r) => r.recipeCategoryId === cat) : recipes;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">📖 Recetario</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Ordenadas para cocinar con lo que ya tienes: primero tus recetas y las que ya has
          preparado, luego las que más se acercan a tu inventario actual.
        </p>
      </div>

      <a href="#agregar-receta" className="card flex items-center gap-3 !p-4">
        <span className="text-xl">✨</span>
        <div className="flex-1">
          <div className="text-sm font-bold">Agregar receta con foto, PDF o link</div>
          <div className="text-xs text-ink-soft">La leemos y precargamos los datos por ti.</div>
        </div>
        <span aria-hidden>↓</span>
      </a>

      <IngredientSearch />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/recetas"
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${!cat ? "bg-mint text-white" : "border-2 border-black/10 bg-white"}`}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/recetas?cat=${c.id}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${cat === c.id ? "bg-mint text-white" : "border-2 border-black/10 bg-white"}`}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        {filtered.map((r) => {
          const complete = r.totalCount > 0 && r.haveCount === r.totalCount;
          return (
            <div key={r.id} className="card !p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{r.name}</span>
                  {r.recipeCategoryName && (
                    <span className="badge-grape">
                      {r.recipeCategoryEmoji} {r.recipeCategoryName}
                    </span>
                  )}
                  {r.source === "user" && <span className="badge-mint">Tuya</span>}
                  <span className="text-xs text-ink-soft">{r.servings} 👤</span>
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
        {filtered.length === 0 && <p className="text-sm text-ink-soft">No hay recetas en esta categoría todavía.</p>}
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-bold text-brand-text">
          <span>👩‍🍳</span> Agregar receta
        </h2>
        <div className="mt-4">
          <AddRecipeForm categories={categories} />
        </div>
      </section>
    </div>
  );
}
