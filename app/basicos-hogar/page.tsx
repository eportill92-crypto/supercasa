export const dynamic = "force-dynamic";

import Link from "next/link";
import { addManualShoppingItem } from "@/lib/actions/shopping-list";
import { listProductCategories } from "@/lib/actions/categories";

const BASICS: { section: string; emoji: string; category: string; items: string[] }[] = [
  { section: "Cocina y despensa", emoji: "🍳", category: "Abarrotes y despensa", items: ["Aceite vegetal", "Sal", "Azúcar", "Arroz", "Frijol", "Café o té"] },
  { section: "Limpieza", emoji: "🧽", category: "Limpieza del hogar", items: ["Detergente para trastes", "Cloro", "Papel higiénico", "Bolsas de basura"] },
  { section: "Higiene personal", emoji: "🧴", category: "Higiene personal", items: ["Jabón de manos", "Pasta y cepillo de dientes", "Shampoo"] },
];

export default async function BasicosHogarPage() {
  const categories = await listProductCategories();
  const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/pedir-super" className="btn-ghost !px-2">
          ←
        </Link>
        <h1 className="text-2xl font-extrabold">✨ Básicos del hogar</h1>
      </div>

      <div className="card border-brand/20 bg-brand-light/50 text-sm text-brand-text">
        💡 Esto es solo inspiración — lo que casi toda casa siempre tiene que reponer. Agrega lo
        que sí uses tú, el resto lo ignoramos.
      </div>

      {BASICS.map((group) => (
        <section key={group.section}>
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
            {group.emoji} {group.section}
          </h2>
          <div className="card flex flex-col divide-y divide-black/5 !p-0">
            {group.items.map((name) => (
              <form key={name} action={addManualShoppingItem} className="flex items-center gap-3 px-5 py-3">
                <input type="hidden" name="name" value={name} />
                <input type="hidden" name="quantity" value={1} />
                <input type="hidden" name="productCategoryId" value={categoryIdByName.get(group.category) ?? ""} />
                <span className="flex-1 text-sm font-bold">{name}</span>
                <button type="submit" className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white">
                  + Agregar
                </button>
              </form>
            ))}
          </div>
        </section>
      ))}

      <Link href="/lista-compra" className="btn-primary text-center">
        Ir a mi lista
      </Link>
    </div>
  );
}
