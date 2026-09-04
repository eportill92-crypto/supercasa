export const dynamic = "force-dynamic";

import Link from "next/link";
import { listProductsGroupedByCategory, createProductCategoryAction } from "@/lib/actions/categories";
import { addManualShoppingItem, addExistingProductToList, computeShoppingList } from "@/lib/actions/shopping-list";

export default async function PedirSuperPage() {
  const [groups, shoppingList] = await Promise.all([listProductsGroupedByCategory(), computeShoppingList()]);

  const lowStock = shoppingList.filter((r) => r.reason === "stock_bajo");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">🛒 Pedir el súper</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Arma tu pedido por categoría. Lo que agregues aquí se suma a{" "}
          <Link href="/lista-compra" className="font-bold text-brand underline">
            Mi lista
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/basicos-hogar" className="card flex flex-1 min-w-[220px] items-center gap-3 !p-4">
          <span className="text-xl">✨</span>
          <span className="text-sm font-bold">¿No sabes por dónde empezar? Mira los básicos del hogar</span>
        </Link>
        <Link href="/inventario" className="card flex flex-1 min-w-[220px] items-center gap-3 !p-4">
          <span className="text-xl">🧺</span>
          <span className="text-sm font-bold">Ver mi despensa completa</span>
        </Link>
      </div>

      {lowStock.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-sun-text">Se te está acabando</h2>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((row) => (
              <form key={row.productId} action={addExistingProductToList}>
                <input type="hidden" name="productId" value={row.productId} />
                <input type="hidden" name="quantity" value={row.suggestedQty} />
                <button type="submit" className="badge-sun">
                  {row.name} <span className="font-black">+</span>
                </button>
              </form>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">Categorías</h2>
        </div>

        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <details key={group.id} className="card !p-0 open:pb-2">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-bold">
                <span>
                  {group.emoji} {group.name}
                </span>
                <span className="text-sm text-ink-soft">{group.products.length}</span>
              </summary>

              <div className="flex flex-col divide-y divide-black/5 border-t border-black/5">
                {group.products.map((product) => (
                  <form
                    key={product.id}
                    action={addExistingProductToList}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <input type="hidden" name="productId" value={product.id} />
                    <div className="flex-1">
                      <div className="text-sm font-bold">{product.name}</div>
                      {product.brand && <div className="text-xs text-ink-soft">🏷️ {product.brand}</div>}
                    </div>
                    <input
                      name="quantity"
                      type="number"
                      step="0.5"
                      defaultValue={1}
                      className="w-16 rounded-xl border-2 border-black/10 px-2 py-1 text-sm"
                    />
                    <button type="submit" className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white">
                      + Agregar
                    </button>
                  </form>
                ))}

                <form action={addManualShoppingItem} className="grid gap-2 px-5 py-3 sm:grid-cols-4">
                  <input type="hidden" name="productCategoryId" value={group.id === "sin-categoria" ? "" : group.id} />
                  <input name="name" required placeholder="Nombre del producto" className="input sm:col-span-2" />
                  <input name="brand" placeholder="Marca (opcional)" className="input" />
                  <input name="quantity" type="number" step="0.5" defaultValue={1} className="input" />
                  <div className="sm:col-span-4">
                    <button type="submit" className="btn-ghost !px-2 !py-1 text-xs text-brand">
                      + Agregar otro producto de esta categoría
                    </button>
                  </div>
                </form>
              </div>
            </details>
          ))}
        </div>

        <details className="card mt-3 !p-0">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold text-brand">
            + Crear categoría propia
          </summary>
          <form action={createProductCategoryAction} className="flex gap-2 border-t border-black/5 px-5 py-3">
            <input name="emoji" placeholder="🏷️" maxLength={2} className="input w-16 text-center" />
            <input name="name" required placeholder="Nombre de la categoría" className="input flex-1" />
            <button type="submit" className="btn-secondary">
              Crear
            </button>
          </form>
        </details>
      </section>

      <div className="sticky bottom-4">
        <Link href="/lista-compra" className="btn-primary block text-center">
          Ver mi lista · {shoppingList.length} productos
        </Link>
      </div>
    </div>
  );
}
