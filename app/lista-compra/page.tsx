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
        <h1 className="text-2xl font-semibold">Lista de compra</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Calculada a partir de lo que está por debajo del mínimo en tu inventario, más lo que
          agregues a mano. Ajusta cantidades y pide directo a La Comer.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No falta nada por ahora. Cuando algo baje del mínimo en tu inventario, aparecerá
            aquí automáticamente.
          </p>
        ) : (
          <ShoppingListActions rows={rows} />
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-medium">Agregar algo que falta (fuera de lo automático)</h2>
        <form action={addManualShoppingItem} className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            name="name"
            required
            placeholder="Producto"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            name="unit"
            placeholder="Unidad"
            defaultValue="pza"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="quantity"
            type="number"
            step="0.5"
            defaultValue={1}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <div className="sm:col-span-4">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Agregar a la lista
            </button>
          </div>
        </form>

        {manualItems.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1">
            {manualItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span>
                  {item.product.name} × {item.quantity} {item.product.unit}
                </span>
                <form action={removeManualShoppingItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-xs text-zinc-400 hover:text-red-600">
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
