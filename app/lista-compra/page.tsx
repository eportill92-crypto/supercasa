export const dynamic = "force-dynamic";

import {
  computeShoppingList,
  addManualShoppingItem,
  removeManualShoppingItem,
  listManualShoppingItems,
} from "@/lib/actions/shopping-list";
import ShoppingListActions from "@/components/ShoppingListActions";

export default async function ListaCompraPage() {
  const [rows, manualItems] = await Promise.all([computeShoppingList(), listManualShoppingItems()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">🛒 Lista de compra</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Calculada a partir de lo que está por debajo del mínimo en tu inventario, más lo que
          agregues a mano. Ajusta cantidades y pide directo a La Comer.
        </p>
      </div>

      <section className="card">
        {rows.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No falta nada por ahora. Cuando algo baje del mínimo en tu inventario, aparecerá
            aquí automáticamente. ✨
          </p>
        ) : (
          <ShoppingListActions rows={rows} />
        )}
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
    </div>
  );
}
