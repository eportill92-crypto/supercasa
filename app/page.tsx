export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/auth";
import { computeShoppingList } from "@/lib/actions/shopping-list";
import { hasLacomerCredentials, getDefaultAddress } from "@/lib/actions/settings";
import { getWeekMealPlan } from "@/lib/actions/meal-plan";
import { getMonday } from "@/lib/date-utils";
import LandingPage from "@/components/LandingPage";

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    return <LandingPage />;
  }

  const monday = getMonday(new Date());
  const [shoppingList, { configured }, address, weekEntries] = await Promise.all([
    computeShoppingList(),
    hasLacomerCredentials(),
    getDefaultAddress(),
    getWeekMealPlan(monday),
  ]);

  const readyToAutomate = configured && !!address;
  const daysPlanned = new Set(weekEntries.map((e) => new Date(e.date).toDateString())).size;
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">Hola{firstName ? `, ${firstName}` : ""} 👋</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}. ¿Qué quieres hacer hoy?
        </p>
      </div>

      {!readyToAutomate && (
        <div className="card border-sun/30 bg-sun-light/60 text-sm text-sun-text">
          <span className="mr-1">💡</span>
          Para poder pedir automáticamente en La Comer necesitas guardar{" "}
          {!configured && "tus credenciales"}
          {!configured && !address && " y "}
          {!address && "tu dirección de entrega"} en{" "}
          <Link href="/configuracion" className="font-bold underline">
            Configuración
          </Link>
          .
        </div>
      )}

      {/* Las 3 opciones principales de inicio: pedir el súper, planear la semana y el
          recetario — sin despensa/inventario (difícil de mantener al día, se quitó). */}
      <div className="flex flex-col gap-4">
        <Link
          href="/pedir-super"
          className="rounded-3xl p-6 text-white shadow-lg transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#1b4332 0%,#0f2e21 100%)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">🛒</span>
            {shoppingList.length > 0 && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                {shoppingList.length} en tu lista
              </span>
            )}
          </div>
          <div className="mt-3 text-xl font-extrabold">Pedir el súper</div>
          <p className="mt-1 text-sm opacity-90">
            Arma tu pedido con tu lista, tu semana planeada y tu último pedido.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-bold">
            Empezar <span aria-hidden>→</span>
          </div>
        </Link>

        <Link
          href="/menu-semanal"
          className="rounded-3xl p-6 text-white shadow-lg transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#52922f 0%,#2f5c1a 100%)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">📅</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              {daysPlanned} de 7 días listos
            </span>
          </div>
          <div className="mt-3 text-xl font-extrabold">Planear tu semana</div>
          <p className="mt-1 text-sm opacity-90">
            Desayuno, comida, cena y snacks — generamos la lista de compra sola.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-bold">
            Empezar <span aria-hidden>→</span>
          </div>
        </Link>

        <Link
          href="/recetas"
          className="rounded-3xl p-6 text-white shadow-lg transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#9a6b2f 0%,#6b4718 100%)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">📖</span>
          </div>
          <div className="mt-3 text-xl font-extrabold">Recetario</div>
          <p className="mt-1 text-sm opacity-90">
            Tus recetas de siempre, o súbelas por foto, PDF o link y las leemos por ti.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-bold">
            Empezar <span aria-hidden>→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
