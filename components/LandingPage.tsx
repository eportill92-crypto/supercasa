import Link from "next/link";
import Image from "next/image";
import LeadForm from "./LeadForm";

export default function LandingPage() {
  return (
    // El <main> global de la app limita el ancho a max-w-5xl (pensado para el dashboard) —
    // esto la saca de ese contenedor para usar el ancho real de la pantalla, con su propio
    // máximo más generoso para pantallas grandes. El -mt-6 cancela el py-6 que <main> le pone
    // arriba (si no, queda una franja crema entre el header y el verde del hero).
    <div className="relative left-1/2 right-1/2 -mx-[50vw] -mt-6 w-screen">
      {/* Hero — fondo propio (degradado verde bosque de marca + resplandores difuminados) que
          se sale del ancho del contenido para distinguirse como su propio bloque. Estilo
          inspirado en la referencia de marca del usuario: tipografía sans en negritas (no
          serif editorial), verde oscuro, foto de producto real en vez de screenshot grande. */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#1f4d38_0%,#153626_55%,#0d2419_100%)] px-6 py-6 sm:px-10 lg:px-16 lg:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-mint opacity-20 blur-[110px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-brand-light opacity-10 blur-[110px]"
        />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-cream sm:text-5xl lg:text-6xl">
              Tu casa,
              <br />
              organizada
              <br />y{" "}
              <span className="relative inline-block">
                sin esfuerzo.
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[6px] w-full rounded-full bg-mint sm:-bottom-2"
                />
              </span>
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-cream/75">
              Planea, compra y recibe tu súper, todo en un solo lugar. Productos de calidad,
              recetas y una casa más en orden.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-6">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-mint-light px-7 py-3 text-sm font-bold text-brand-text shadow-[0_1px_2px_rgba(0,0,0,0.15),0_8px_24px_-8px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 hover:bg-mint hover:text-cream"
              >
                Crear cuenta gratis <span aria-hidden>→</span>
              </Link>
              <a href="#como-funciona" className="inline-flex items-center gap-2 text-sm font-bold text-cream">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream/15">
                  <span aria-hidden className="ml-0.5 text-xs">▶</span>
                </span>
                <span className="underline underline-offset-4">Ver cómo funciona</span>
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.2),0_30px_70px_-20px_rgba(0,0,0,0.55)] lg:h-full lg:max-w-none">
            <Image
              src="/landing-hero-bag-v3.png"
              alt="Bolsa de tela de SuperCasa llena de verduras, jitomates y pan, sobre una barra de cocina"
              width={506}
              height={500}
              className="h-auto w-full lg:h-full lg:w-full lg:object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-16 px-6 py-12 sm:px-10 lg:px-16">
        {/* Franja de beneficios — igual que la referencia, 3 tarjetas con ícono. */}
        <section className="grid grid-cols-1 gap-6 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_2px_16px_-6px_rgba(41,37,36,0.1)] sm:grid-cols-3 sm:p-8">
          {[
            { icon: "⚡", title: "Ahorra tiempo", text: "Tu súper y tu semana, en minutos." },
            { icon: "🔁", title: "Se repite solo", text: "Pedidos automáticos cuando tú quieras." },
            { icon: "🗂️", title: "Todo en un lugar", text: "Lista, plan semanal y recetas juntos." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint-light text-xl">
                {item.icon}
              </span>
              <div>
                <div className="font-extrabold text-ink">{item.title}</div>
                <div className="text-sm text-ink-soft">{item.text}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Cómo funciona — 3 pasos numerados, estilo de la referencia. */}
        <section id="como-funciona">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-mint-dark">
            Cómo funciona
          </span>
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Muy simple.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {[
              { n: "1", title: "Planea", text: "Agrega a tu lista, planea tu semana o guarda tus recetas." },
              { n: "2", title: "Revisamos por ti", text: "Armamos tu pedido con tu lista, tu plan y tu historial." },
              { n: "3", title: "Recíbelo en casa", text: "Pedido automático a tu súper, en el horario que prefieras." },
            ].map((step) => (
              <div key={step.n} className="flex flex-col gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint-light text-lg font-extrabold text-brand-text">
                  {step.n}
                </span>
                <div className="font-extrabold text-ink">{step.title}</div>
                <p className="text-sm text-ink-soft">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Funcionalidades — capturas reales de la app, no mockups. */}
        <section id="funcionalidades">
          <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Todo lo que hace por ti
          </h2>
          <div className="mt-10 flex flex-col gap-5">
            <Image
              src="/landing-pedir-super.png"
              alt="Pedir el súper: arma tu pedido por categoría, con lo que ya sabes que compras seguido."
              width={2032}
              height={616}
              className="h-auto w-full rounded-sm"
            />
            <Image
              src="/landing-mi-lista.png"
              alt="Mi lista: una sola lista para comida, limpieza, higiene y lo que se te ocurra."
              width={2166}
              height={964}
              className="h-auto w-full rounded-sm"
            />
            <Image
              src="/landing-planear-semana.png"
              alt="Planear tu semana: desayuno, comida, cena y snacks — la lista de compra se arma sola."
              width={2216}
              height={1432}
              className="h-auto w-full rounded-sm"
            />
            <Image
              src="/landing-pedidos-auto.png"
              alt="Pedidos automáticos: conecta tu cuenta del súper y deja que el pedido se arme solo."
              width={2166}
              height={304}
              className="h-auto w-full rounded-sm"
            />
            <Image
              src="/landing-recetario.png"
              alt="Recetario: tus recetas de siempre, o súbelas por foto, PDF o link y las leemos por ti."
              width={2216}
              height={718}
              className="h-auto w-full rounded-sm"
            />
          </div>
        </section>

        {/* CTA final — captura real y actual del dashboard. */}
        <section className="grid items-center gap-10 rounded-2xl bg-mint-light p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
          <div className="flex flex-col gap-5">
            <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              ¿Le damos una organizada a tu casa?
            </h2>
            <ul className="flex flex-col gap-2.5 text-[15px] text-ink">
              {["Planea tus comidas", "Arma tu pedido en minutos", "Repite tu último pedido fácil"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint-dark text-xs text-cream">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-6">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-sm font-bold text-cream shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(27,67,50,0.5)] transition hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                Empezar ahora
              </Link>
              <Link
                href="/login"
                className="text-sm font-bold uppercase tracking-wide text-ink underline underline-offset-4"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="absolute -right-4 -bottom-4 h-full w-full rounded-sm bg-brand-light/50 sm:-right-6 sm:-bottom-6"
            />
            <div className="relative overflow-hidden rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.2),0_20px_50px_-20px_rgba(28,35,51,0.4)]">
              <Image
                src="/landing-screenshot-v2.png"
                alt="Pantalla de inicio de SuperCasa, con los accesos a Pedir el súper, Planear tu semana y Recetario"
                width={1400}
                height={780}
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        {/* Contacto — alargada y debajo del CTA, no metida en la mitad de la columna, para que
            el formulario respire y no compita con el botón de "Empezar ahora" de arriba. */}
        <section className="rounded-2xl bg-sun-light p-10 shadow-[0_30px_60px_-24px_rgba(28,35,51,0.3)] lg:p-14">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            ¿Prefieres que te contactemos nosotros?
          </h2>
          <p className="mt-2 max-w-md text-[15px] text-ink-soft">
            Déjanos tus datos y te buscamos para ayudarte a empezar.
          </p>
          <div className="mt-6">
            <LeadForm />
          </div>
        </section>
      </div>
    </div>
  );
}
