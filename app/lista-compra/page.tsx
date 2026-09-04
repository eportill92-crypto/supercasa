export const dynamic = "force-dynamic";

import {
  computeShoppingListWithCategory,
  addManualShoppingItem,
  removeManualShoppingItem,
  listManualShoppingItems,
} from "@/lib/actions/shopping-list";
import { listProductCategories, createProductCategoryAction } from "@/lib/actions/categories";
import ShoppingListActions from "@/components/ShoppingListActions";

const QUICK_ADD_CATEGORIES = ["Higiene personal", "Limpieza del hogar", "Mascotas"];

export default async function ListaCompraPage() {
  const [rows, manualItems, categories] = await Promise.all([
    computeShoppingListWithCategory(),
    listManualShoppingItems(),
    listProductCategories(),
  ]);

  const quickCategories = categories.filter((c) => QUICK_ADD_CATEGORIES.includes(c.name));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">🧾 Mi lista</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {rows.length} producto{rows.length === 1 ? "" : "s"} — se arma sola con lo que está bajo
          en tu despensa, más lo que agregues a mano. Ajusta cantidades y pide directo a La Comer.
        </p>
      </div>

      <section className="card">
        {rows.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No falta nada por ahora. Cuando algo baje del mínimo en tu despensa, aparecerá aquí
            automáticamente. ✨
          </p>
        ) : (
          <ShoppingListActions rows={rows} />
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
          + Agregar a mi lista
        </h2>
        <div className="flex flex-wrap gap-2">
          {quickCategories.map((cat) => (
            <details key={cat.id} className="inline-block">
              <summary className="cursor-pointer list-none rounded-full border-2 border-black/10 bg-white px-3.5 py-1.5 text-xs font-bold">
                {cat.emoji} {cat.name}
              </summary>
              <form action={addManualShoppingItem} className="card mt-2 flex flex-wrap gap-2 !p-3">
                <input type="hidden" name="productCategoryId" value={cat.id} />
                <input name="name" required placeholder="Producto" className="input flex-1 min-w-[140px]" />
                <input name="brand" placeholder="Marca (opcional)" className="input w-32" />
                <input name="quantity" type="number" step="0.5" defaultValue={1} className="input w-20" />
                <button type="submit" className="btn-primary">
                  Agregar
                </button>
              </form>
            </details>
          ))}
          <details className="inline-block">
            <summary className="cursor-pointer list-none rounded-full bg-mint-light px-3.5 py-1.5 text-xs font-bold text-mint-text">
              + Otra categoría
            </summary>
            <form action={createProductCategoryAction} className="card mt-2 flex flex-wrap gap-2 !p-3">
              <input name="emoji" placeholder="🏷️" maxLength={2} className="input w-16 text-center" />
              <input name="name" required placeholder="Nombre de la categoría" className="input flex-1 min-w-[160px]" />
              <button type="submit" className="btn-secondary">
                Crear
              </button>
            </form>
          </details>
        </div>
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-bold text-brand-text">
          <span>➕</span> Agregar algo que falta (fuera de lo automático)
        </h2>
        <form action={addManualShoppingItem} className="mt-4 grid gap-3 sm:grid-cols-4">
          <input name="name" required placeholder="Producto" className="input sm:col-span-2" />
          <input name="unit" placeholder="Unidad" defaultValue="pza" className="input" />
          <input name="quantity" type="number" step="0.5" defaultValue={1} className="input" />
          <div className="sm:col-span-4">
            <button type="submit" className="btn-primary">
              Agregar a la lista
            </button>
          </div>
        </form>

        {manualItems.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1 divide-y divide-black/5">
            {manualItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {item.product.name} × {item.quantity} {item.product.unit}
                </span>
                <form action={removeManualShoppingItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-xs font-semibold text-ink-soft hover:text-berry-text">
                    Quitar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-ink-soft">
        💡 El precio final lo confirma La Comer al momento de pedir — esto es solo tu lista.
      </p>
    </div>
  );
}
