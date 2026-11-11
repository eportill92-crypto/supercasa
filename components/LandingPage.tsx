import Link from "next/link";
import Image from "next/image";
import { Fraunces } from "next/font/google";
import LeadForm from "./LeadForm";

// Serif editorial, solo para esta página — el resto de la app sigue con Geist (sans) como
// siempre. Inspirado en el estilo de marcas tipo boutique (serif cálido, paleta terrosa,
// mucho espacio en blanco) en vez del lenguaje de tarjetas de colores del resto de la app.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Grano sutil (SVG feTurbulence) superpuesto a toda la página — la textura plana de los
// bloques de color se sentía "de maqueta"; esto le da algo de profundidad táctil sin
// depender de fotografía real. Puramente decorativo (pointer-events-none), cero JS.
const GRAIN_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export default function LandingPage() {
  return (
    // El <main> global de la app limita el ancho a max-w-5xl (pensado para el dashboard) —
    // esto la saca de ese contenedor para usar el ancho real de la pantalla, con su propio
    // máximo más generoso para pantallas grandes. El -mt-6 cancela el py-6 que <main> le pone
    // arriba (si no, queda una franja crema entre el header y el azul del hero).
    <div className={`${fraunces.className} relative left-1/2 right-1/2 -mx-[50vw] -mt-6 w-screen`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN_URL}")` }}
      />

      {/* Hero — fondo propio (degradado azul de marca + resplandor difuminado) que se sale del
          ancho del contenido para distinguirse como su propio bloque, en vez de vivir sobre el
          crema del resto de la página. */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#2b4ea8_0%,#1c3578_55%,#162a5e_100%)] px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-mint-dark opacity-20 blur-[110px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-brand-light opacity-10 blur-[110px]"
        />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 lg:min-h-[calc(100vh-14rem)] lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-7">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-light/80">
              Para tu casa
            </span>
            <h1 className="text-6xl leading-[0.98] font-medium tracking-tight text-cream sm:text-7xl lg:text-[5.5rem]">
              Tu despensa,
              <br />
              tu súper y tu semana,
              <br />
              <em className="italic text-mint-dark">organizados solos.</em>
            </h1>
            <p className="max-w-sm text-[15px] leading-relaxed text-cream/70">
              SuperCasa lleva el control de lo que tienes en casa, te ayuda a planear qué van a
              comer y arma el pedido del súper por ti — todo en un solo lugar.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-6">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center rounded-full bg-cream px-7 py-3 text-sm font-semibold text-brand-dark shadow-[0_1px_2px_rgba(0,0,0,0.15),0_8px_24px_-8px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold uppercase tracking-wide text-cream underline underline-offset-4"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute -right-4 -bottom-4 h-full w-full rounded-sm bg-mint-dark sm:-right-6 sm:-bottom-6"
            />
            <div className="relative overflow-hidden rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.2),0_30px_70px_-20px_rgba(0,0,0,0.55)]">
              <Image
                src="/landing-screenshot.png"
                alt="Pantalla de inicio de SuperCasa, con el resumen de la despensa y los accesos a Pedir el súper y Planear tu semana"
                width={1400}
                height={780}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-16 px-6 py-8 sm:px-10 lg:px-16">
        {/* Features — cada fila usa el ancho real de sus dos recortes como proporción de
            columnas, para que ambos lados compartan la misma altura sin recortar nada de la
            imagen (el texto y el logo ya vienen incluidos en cada captura). */}
        {/* Ancho más angosto que el resto de la página a propósito, y centrado (no solo el
              título) para que se vea como una columna intencional y no como espacio sobrante a
              un lado: con el ancho completo (1400px) las 3 filas salían demasiado altas para
              caber en una pantalla normal al 100% de zoom. */}
        <section className="mx-auto max-w-[1300px]">
          <h2 className="text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Todo lo que hace por ti
          </h2>
          <div className="mt-10 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-5 sm:[grid-template-columns:1055fr_611fr]">
              <Image
                src="/landing-despensa.png"
                alt="Mi despensa: lo que tienes en casa, agrupado por categoría, con aviso de qué se está acabando."
                width={1055}
                height={296}
                className="h-auto w-full rounded-sm"
              />
              <Image
                src="/landing-pedir-super.png"
                alt="Pedir el súper: arma tu pedido por categoría, con lo que ya sabes que compras seguido."
                width={611}
                height={296}
                className="h-auto w-full rounded-sm"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:[grid-template-columns:570fr_1101fr]">
              <Image
                src="/landing-mi-lista.png"
                alt="Mi lista: una sola lista para comida, limpieza, higiene y lo que se te ocurra."
                width={570}
                height={271}
                className="h-auto w-full rounded-sm"
              />
              <Image
                src="/landing-planear-semana.png"
                alt="Planear tu semana: desayuno, comida, cena y snacks — la lista de compra se arma sola."
                width={1101}
                height={271}
                className="h-auto w-full rounded-sm"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:[grid-template-columns:985fr_681fr]">
              <Image
                src="/landing-recetario.png"
                alt="Recetario: tus recetas de siempre, o súbelas por foto, PDF o link y las leemos por ti."
                width={985}
                height={264}
                className="h-auto w-full rounded-sm"
              />
              <Image
                src="/landing-pedidos-auto.png"
                alt="Pedidos automáticos: conecta tu cuenta del súper y deja que el pedido se arme solo."
                width={681}
                height={264}
                className="h-auto w-full rounded-sm"
              />
            </div>
          </div>
        </section>

        {/* CTA final, dos columnas */}
        <section className="grid items-center gap-14 border-t border-black/10 pt-16 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-soft">
              Únete a SuperCasa
            </span>
            <h2 className="text-5xl font-medium leading-[1.02] tracking-tight text-ink">
              ¿Le damos una organizada a tu casa?
            </h2>
            <p className="max-w-sm text-[15px] text-ink-soft">
              Crear tu cuenta toma un minuto y es gratis.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-6">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-cream shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-black"
              >
                Empezar ahora
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold uppercase tracking-wide text-ink underline underline-offset-4"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
          <div className="relative">
            <div aria-hidden className="absolute -right-4 -bottom-4 h-full w-full rounded-sm bg-ink sm:-right-6 sm:-bottom-6" />
            <div className="relative overflow-hidden rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.2),0_30px_70px_-20px_rgba(0,0,0,0.55)]">
              <Image
                src="/landing-screenshot.png"
                alt="Pantalla de inicio de SuperCasa, con el resumen de la despensa y los accesos a Pedir el súper y Planear tu semana"
                width={1400}
                height={780}
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        {/* Contacto — alargada y debajo del CTA, no metida en la mitad de la columna, para que
            el formulario respire y no compita con el botón de "Empezar ahora" de arriba. */}
        <section className="rounded-sm bg-sun-light p-10 shadow-[0_30px_60px_-24px_rgba(28,35,51,0.3)] lg:p-14">
          <h2 className="text-3xl font-medium tracking-tight text-ink sm:text-4xl">
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
