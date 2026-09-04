export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  listPantry,
  addPantryProduct,
  updatePantryItem,
  useProduct,
  deletePantryItem,
} from "@/lib/actions/pantry";
import { listProductCategories } from "@/lib/actions/categories";
import { computeDailyUsageRates, estimateDaysRemaining } from "@/lib/usage-estimate";

type StockLevel = "agotado" | "bajo" | "bien";

function stockLevel(quantity: number, minThreshold: number): StockLevel {
  if (quantity <= 0) return "agotado";
  if (quantity <= minThreshold) return "bajo";
  return "bien";
}

const STOCK_BADGE: Record<StockLevel, { label: string; className: string }> = {
  agotado: { label: "Agotado", className: "badge-berry" },
  bajo: { label: "Se está acabando", className: "badge-sun" },
  bien: { label: "Bien surtido", className: "badge-mint" },
};

export default async function InventarioPage() {
  const [items, usageRates, categories] = await Promise.all([
    listPantry(),
    computeDailyUsageRates(),
    listProductCategories(),
  ]);

  const counts = { agotado: 0, bajo: 0, bien: 0 };
  for (const item of items) counts[stockLevel(item.quantity, item.minThreshold)] += 1;

  const groups = new Map<string, { name: string; emoji: string; items: typeof items }>();
  for (const item of items) {
    const cat = item.product.productCategoryId
      ? categories.find((c) => c.id === item.product.productCategoryId)
      : null;
    const key = cat?.id ?? "sin-categoria";
    if (!groups.has(key)) groups.set(key, { name: cat?.name ?? "Sin categoría", emoji: cat?.emoji ?? "🏷️", items: [] });
    groups.get(key)!.items.push(item);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">🧺 Mi despensa</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Lo que tienes en casa ahora mismo, agrupado por categoría. Con esto recomendamos qué
          agregar en{" "}
          <Link href="/pedir-super" className="font-bold text-brand underline">
            Pedir el súper
          </Link>{" "}
          y qué recetas te alcanzan en{" "}
          <Link href="/menu-semanal" className="font-bold text-brand underline">
            Planear tu semana
          </Link>
          .
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card !p-3 border-none bg-mint-light text-center">
          <div className="text-xl font-extrabold text-mint-text">{counts.bien}</div>
          <div className="text-[11px] font-bold text-mint-text">Bien surtido</div>
        </div>
        <div className="card !p-3 border-none bg-sun-light text-center">
          <div className="text-xl font-extrabold text-sun-text">{counts.bajo}</div>
          <div className="text-[11px] font-bold text-sun-text">Se está acabando</div>
        </div>
        <div className="card !p-3 border-none bg-berry-light text-center">
          <div className="text-xl font-extrabold text-berry-text">{counts.agotado}</div>
          <div className="text-[11px] font-bold text-berry-text">Agotado</div>
        </div>
      </div>

      {items.length === 0 && (
        <p className="card text-center text-sm text-ink-soft">Aún no hay productos en el inventario.</p>
      )}

      {Array.from(groups.values()).map((group) => (
        <section key={group.name}>
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
            {group.emoji} {group.name}
          </h2>
          <div className="card flex flex-col divide-y divide-black/5 !p-0">
            {group.items.map((item) => {
              const level = stockLevel(item.quantity, item.minThreshold);
              const badge = STOCK_BADGE[level];
              return (
                <div key={item.id} className="flex flex-col gap-2 px-4 py-3 text-sm">
                  <div>
                    <div className="font-bold text-ink">{item.product.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
                      <span className={badge.className}>{badge.label}</span>
                      {item.product.brand && <span>🏷️ {item.product.brand}</span>}
                      <span>· {item.product.unit}</span>
                      {(() => {
                        const days = estimateDaysRemaining(item.quantity, usageRates.get(item.productId));
                        return days !== null && days <= 5 ? <span className="badge-berry">~{days} días</span> : null;
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={updatePantryItem} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="minThreshold" value={item.minThreshold} />
                      <input type="hidden" name="targetQty" value={item.targetQty ?? ""} />
                      <input
                        name="quantity"
                        type="number"
                        step="0.5"
                        defaultValue={item.quantity}
                        className="w-16 rounded-xl border-2 border-black/10 px-2 py-1 text-sm"
                      />
                      <button type="submit" className="btn-ghost !px-2 !py-1 text-xs">
                        Guardar
                      </button>
                    </form>
                    <form action={useProduct}>
                      <input type="hidden" name="productId" value={item.productId} />
                      <input type="hidden" name="quantity" value={1} />
                      <button
                        type="submit"
                        className="rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-white transition hover:bg-mint-dark active:scale-95"
                      >
                        Usar 1
                      </button>
                    </form>
                    <form action={deletePantryItem} className="ml-auto">
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="text-xs font-semibold text-ink-soft hover:text-berry-text">
                        Quitar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

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
          <select name="productCategoryId" defaultValue="" className="input">
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
          <input name="brand" placeholder="Marca (opcional)" className="input" />
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
