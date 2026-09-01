export const dynamic = "force-dynamic";

import {
  listPantry,
  addPantryProduct,
  updatePantryItem,
  useProduct,
  deletePantryItem,
} from "@/lib/actions/pantry";
import { computeDailyUsageRates, estimateDaysRemaining } from "@/lib/usage-estimate";

export default async function InventarioPage() {
  const [items, usageRates] = await Promise.all([listPantry(), computeDailyUsageRates()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">📦 Inventario de la cocina</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Lo que tienes en casa ahora mismo. Usa un producto para descontarlo automáticamente, o
          ajusta la cantidad a mano tras contar la despensa.
        </p>
      </div>

      <section className="card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-brand-light/40 text-left text-xs font-bold uppercase tracking-wide text-brand-text">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Mínimo</th>
              <th className="px-4 py-3">Objetivo</th>
              <th className="px-4 py-3">Duración estimada</th>
              <th className="px-4 py-3">Usar</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const low = item.quantity <= item.minThreshold;
              return (
                <tr key={item.id} className={`border-b border-black/5 last:border-0 ${low ? "bg-berry-light/25" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-bold text-ink">{item.product.name}</div>
                    <div className="text-xs text-ink-soft">
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
                        className={`w-20 rounded-xl border-2 px-2 py-1 text-sm ${
                          low ? "border-berry/40 bg-white text-berry-text" : "border-black/10"
                        }`}
                      />
                      <button type="submit" className="btn-ghost !px-2 !py-1 text-xs">
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
                        className="w-16 rounded-xl border-2 border-black/10 px-2 py-1 text-sm"
                      />
                      <button type="submit" className="btn-ghost !px-2 !py-1 text-xs">
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
                        className="w-16 rounded-xl border-2 border-black/10 px-2 py-1 text-sm"
                      />
                      <button type="submit" className="btn-ghost !px-2 !py-1 text-xs">
                        ✓
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {(() => {
                      const days = estimateDaysRemaining(item.quantity, usageRates.get(item.productId));
                      return days === null ? (
                        <span className="text-ink-soft/60">Sin datos aún</span>
                      ) : days <= 5 ? (
                        <span className="badge-berry">~{days} días</span>
                      ) : (
                        <span className="text-ink-soft">~{days} días</span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <form action={useProduct} className="flex items-center gap-1">
                      <input type="hidden" name="productId" value={item.productId} />
                      <input
                        name="quantity"
                        type="number"
                        step="0.5"
                        defaultValue={1}
                        className="w-14 rounded-xl border-2 border-black/10 px-2 py-1 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-white transition hover:bg-mint-dark active:scale-95"
                      >
                        Usar
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deletePantryItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="text-xs font-semibold text-ink-soft hover:text-berry-text">
                        Quitar
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-soft">
                  Aún no hay productos en el inventario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-bold text-brand-text">
          <span>➕</span> Agregar producto nuevo
        </h2>
        <form action={addPantryProduct} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            name="name"
            required
            placeholder="Nombre (ej. Leche entera 1L)"
            className="input sm:col-span-2"
          />
          <input name="category" placeholder="Categoría (opcional)" className="input" />
          <input name="unit" placeholder="Unidad (pza, kg, L...)" defaultValue="pza" className="input" />
          <input
            name="quantity"
            type="number"
            step="0.5"
            placeholder="Cantidad actual"
            defaultValue={0}
            className="input"
          />
          <input
            name="minThreshold"
            type="number"
            step="0.5"
            placeholder="Mínimo antes de reponer"
            defaultValue={1}
            className="input"
          />
          <div className="sm:col-span-3">
            <button type="submit" className="btn-primary">
              Agregar a la despensa
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
