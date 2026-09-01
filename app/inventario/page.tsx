export const dynamic = "force-dynamic";

import {
  listPantry,
  addPantryProduct,
  updatePantryItem,
  useProduct,
  deletePantryItem,
} from "@/lib/actions/pantry";

export default async function InventarioPage() {
  const items = await listPantry();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Inventario de la cocina</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Lo que tienes en casa ahora mismo. Usa un producto para descontarlo automáticamente, o
          ajusta la cantidad a mano tras contar la despensa.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Mínimo</th>
              <th className="px-4 py-3">Objetivo</th>
              <th className="px-4 py-3">Usar</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const low = item.quantity <= item.minThreshold;
              return (
                <tr key={item.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">{item.product.name}</div>
                    <div className="text-xs text-zinc-400">
                      {item.product.category ?? "Sin categoría"} · {item.product.unit}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updatePantryItem} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="minThreshold" value={item.minThreshold} />
                      <input type="hidden" name="targetQty" value={item.targetQty ?? ""} />
                      <input
                        name="quantity"
                        type="number"
                        step="0.5"
                        defaultValue={item.quantity}
                        className={`w-20 rounded-md border px-2 py-1 text-sm ${
                          low ? "border-red-300 bg-red-50 text-red-700" : "border-zinc-300"
                        }`}
                      />
                      <button
                        type="submit"
                        className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
                      >
                        Guardar
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updatePantryItem} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="quantity" value={item.quantity} />
                      <input type="hidden" name="targetQty" value={item.targetQty ?? ""} />
                      <input
                        name="minThreshold"
                        type="number"
                        step="0.5"
                        defaultValue={item.minThreshold}
                        className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
                      >
                        ✓
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updatePantryItem} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="quantity" value={item.quantity} />
                      <input type="hidden" name="minThreshold" value={item.minThreshold} />
                      <input
                        name="targetQty"
                        type="number"
                        step="0.5"
                        defaultValue={item.targetQty ?? ""}
                        placeholder="auto"
                        className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
                      >
                        ✓
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={useProduct} className="flex items-center gap-1">
                      <input type="hidden" name="productId" value={item.productId} />
                      <input
                        name="quantity"
                        type="number"
                        step="0.5"
                        defaultValue={1}
                        className="w-14 rounded-md border border-zinc-300 px-2 py-1 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                      >
                        Usar
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deletePantryItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="text-xs text-zinc-400 hover:text-red-600"
                      >
                        Quitar
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-zinc-400">
                  Aún no hay productos en el inventario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-medium">Agregar producto nuevo</h2>
        <form action={addPantryProduct} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            name="name"
            required
            placeholder="Nombre (ej. Leche entera 1L)"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            name="category"
            placeholder="Categoría (opcional)"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="unit"
            placeholder="Unidad (pza, kg, L...)"
            defaultValue="pza"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="quantity"
            type="number"
            step="0.5"
            placeholder="Cantidad actual"
            defaultValue={0}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="minThreshold"
            type="number"
            step="0.5"
            placeholder="Mínimo antes de reponer"
            defaultValue={1}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Agregar a la despensa
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
