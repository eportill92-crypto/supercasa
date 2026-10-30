import Link from "next/link";

const FEATURES = [
  {
    emoji: "🧺",
    title: "Mi despensa",
    body: "Lleva el control de lo que tienes en casa, agrupado por categoría y con avisos de qué se te está acabando.",
  },
  {
    emoji: "🛒",
    title: "Pedir el súper",
    body: "Arma tu pedido por categoría, con lo que ya sabes que compras seguido — sin empezar de cero cada vez.",
  },
  {
    emoji: "🧾",
    title: "Mi lista",
    body: "Una sola lista de compra para comida, limpieza, higiene y lo que se te ocurra agregar.",
  },
  {
    emoji: "📅",
    title: "Planear tu semana",
    body: "Desayuno, comida, cena y snacks — hasta varios platillos por comida — y la lista de compra se arma sola.",
  },
  {
    emoji: "📖",
    title: "Recetario",
    body: "Tus recetas de siempre, o súbelas por foto, PDF o link y las leemos por ti automáticamente.",
  },
  {
    emoji: "🤖",
    title: "Pedidos automáticos",
    body: "Conecta tu cuenta del súper y deja que SuperCasa arme el pedido en cuanto algo se te está acabando.",
  },
  {
    emoji: "📱",
    title: "Instálala como app",
    body: "Agrégala a tu pantalla de inicio y úsala como una app más, sin pasar por ninguna tienda de aplicaciones.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 py-6">
      <section className="flex flex-col items-center gap-5 py-10 text-center">
        <span className="text-5xl">🛒</span>
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Tu despensa, tu súper y tu semana, <span className="text-brand">organizados solos</span>.
        </h1>
        <p className="max-w-xl text-base text-ink-soft sm:text-lg">
          SuperCasa lleva el control de lo que tienes en casa, te ayuda a planear qué van a comer
          y arma el pedido del súper por ti — todo en un solo lugar.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/registro" className="btn-primary !px-7 !py-3 text-base">
            Crear cuenta gratis
          </Link>
          <Link href="/login" className="btn-secondary !px-7 !py-3 text-base">
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-center text-2xl font-extrabold">Todo lo que hace por ti</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <span className="text-2xl">{f.emoji}</span>
              <h3 className="mt-3 font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card flex flex-col items-center gap-4 !p-10 text-center">
        <h2 className="text-2xl font-extrabold">¿Le damos una organizada a tu casa?</h2>
        <p className="max-w-md text-sm text-ink-soft">
          Crear tu cuenta toma un minuto y es gratis.
        </p>
        <Link href="/registro" className="btn-primary !px-7 !py-3 text-base">
          Empezar ahora
        </Link>
      </section>
    </div>
  );
}
