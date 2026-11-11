import Link from "next/link";
import Image from "next/image";
import type { ComponentType } from "react";
import { Fraunces } from "next/font/google";

// Serif editorial, solo para esta página — el resto de la app sigue con Geist (sans) como
// siempre. Inspirado en el estilo de marcas tipo boutique (serif cálido, paleta terrosa,
// mucho espacio en blanco) en vez del lenguaje de tarjetas de colores del resto de la app.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

type Tone = "sand" | "sage" | "sky" | "ink";

const TONE_BG: Record<Tone, string> = {
  sand: "bg-sun-light",
  sage: "bg-mint-dark",
  sky: "bg-brand-light",
  ink: "bg-ink",
};

const TONE_FG: Record<Tone, string> = {
  sand: "text-ink",
  sage: "text-cream",
  sky: "text-ink",
  ink: "text-cream",
};

const FEATURES: { title: string; body: string; tone: Tone; Icon: ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  {
    title: "Mi despensa",
    body: "Lo que tienes en casa, agrupado por categoría, con aviso de qué se está acabando.",
    tone: "sand",
    Icon: IconBasket,
  },
  {
    title: "Pedir el súper",
    body: "Arma tu pedido por categoría, con lo que ya sabes que compras seguido.",
    tone: "sage",
    Icon: IconCart,
  },
  {
    title: "Mi lista",
    body: "Una sola lista para comida, limpieza, higiene y lo que se te ocurra.",
    tone: "sky",
    Icon: IconList,
  },
  {
    title: "Planear tu semana",
    body: "Desayuno, comida, cena y snacks — la lista de compra se arma sola.",
    tone: "ink",
    Icon: IconCalendar,
  },
  {
    title: "Recetario",
    body: "Tus recetas de siempre, o súbelas por foto, PDF o link y las leemos por ti.",
    tone: "sky",
    Icon: IconBook,
  },
  {
    title: "Pedidos automáticos",
    body: "Conecta tu cuenta del súper y deja que el pedido se arme solo.",
    tone: "sand",
    Icon: IconAuto,
  },
];

// Grano sutil (SVG feTurbulence) superpuesto a toda la página — la textura plana de los
// bloques de color se sentía "de maqueta"; esto le da algo de profundidad táctil sin
// depender de fotografía real. Puramente decorativo (pointer-events-none), cero JS.
const GRAIN_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export default function LandingPage() {
  return (
    // El <main> global de la app limita el ancho a max-w-5xl (pensado para el dashboard) —
    // esto la saca de ese contenedor para usar el ancho real de la pantalla, con su propio
    // máximo más generoso para pantallas grandes.
    <div
      className={`${fraunces.className} relative left-1/2 right-1/2 -mx-[50vw] w-screen px-6 sm:px-10 lg:px-16`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN_URL}")` }}
      />
      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-28 py-8">
      {/* Hero — llena casi toda la primera pantalla en vez de que la siguiente sección se
          asome desde abajo, para que cada sección se sienta como su propio "cuadro" al hacer
          scroll (como el sitio de referencia). */}
      <section className="grid items-center gap-14 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-7">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-soft">
            Para tu casa
          </span>
          <h1 className="text-6xl leading-[0.98] font-medium tracking-tight text-ink sm:text-7xl lg:text-[5.5rem]">
            Tu despensa,
            <br />
            tu súper y tu semana,
            <br />
            <em className="italic text-mint-dark">organizados solos.</em>
          </h1>
          <p className="max-w-sm font-sans text-[15px] leading-relaxed text-ink-soft">
            SuperCasa lleva el control de lo que tienes en casa, te ayuda a planear qué van a
            comer y arma el pedido del súper por ti — todo en un solo lugar.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-6 font-sans">
            <Link
              href="/registro"
              className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-cream shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_14px_28px_-8px_rgba(0,0,0,0.4)]"
            >
              Crear cuenta gratis
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
          <div
            aria-hidden
            className="absolute -right-4 -bottom-4 h-full w-full rounded-sm bg-mint-dark sm:-right-6 sm:-bottom-6"
          />
          <div className="relative overflow-hidden rounded-sm border border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_30px_60px_-20px_rgba(28,35,51,0.35)]">
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
      </section>

      {/* Features — grid tipo "bento" asimétrico en vez de tarjetas uniformes */}
      <section>
        <h2 className="text-4xl font-medium tracking-tight text-ink sm:text-5xl">
          Todo lo que hace por ti
        </h2>
        <div className="mt-12 grid auto-rows-[minmax(14rem,auto)] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureTile key={f.title} feature={f} featured={i === 0} />
          ))}
        </div>
      </section>

      {/* CTA final, dos columnas */}
      <section className="grid items-center gap-14 border-t border-black/10 pt-16 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-5">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-ink-soft">
            Únete a SuperCasa
          </span>
          <h2 className="text-5xl font-medium leading-[1.02] tracking-tight text-ink">
            ¿Le damos una organizada a tu casa?
          </h2>
          <p className="max-w-sm font-sans text-[15px] text-ink-soft">
            Crear tu cuenta toma un minuto y es gratis.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-6 font-sans">
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
          <div className="relative aspect-[4/3] w-full rounded-sm bg-sun-light shadow-[0_30px_60px_-24px_rgba(28,35,51,0.3)]" />
        </div>
      </section>
      </div>
    </div>
  );
}

function FeatureTile({
  feature,
  featured,
}: {
  feature: { title: string; body: string; tone: Tone; Icon: ComponentType<{ className?: string; strokeWidth?: number }> };
  featured: boolean;
}) {
  return (
    <div
      className={`group flex flex-col gap-4 rounded-sm p-7 transition hover:-translate-y-1 ${TONE_BG[feature.tone]} ${
        featured ? "sm:col-span-2 lg:col-span-2 lg:p-10" : ""
      }`}
    >
      <feature.Icon
        className={`shrink-0 ${TONE_FG[feature.tone]} transition-transform duration-200 group-hover:scale-110 ${
          featured ? "h-14 w-14" : "h-9 w-9"
        }`}
      />
      <div className="mt-auto flex flex-col gap-2">
        <h3
          className={`font-sans font-bold uppercase tracking-[0.15em] ${TONE_FG[feature.tone]} ${
            featured ? "text-sm" : "text-xs"
          }`}
        >
          {feature.title}
        </h3>
        <p
          className={`font-sans leading-relaxed ${TONE_FG[feature.tone]} opacity-80 ${
            featured ? "max-w-sm text-base" : "text-sm"
          }`}
        >
          {feature.body}
        </p>
      </div>
    </div>
  );
}

function IconBasket({ className = "h-9 w-9", strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h16l-1.5 9a1.5 1.5 0 0 1-1.5 1.3H7a1.5 1.5 0 0 1-1.5-1.3L4 10Z" />
      <path d="M8 10 9.5 4" />
      <path d="M16 10 14.5 4" />
    </svg>
  );
}

function IconCart({ className = "h-9 w-9", strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.2 11.4A2 2 0 0 0 9.2 17H18a2 2 0 0 0 2-1.6L21.5 8H6" />
      <circle cx="9.5" cy="20.5" r="1.3" />
      <circle cx="17.5" cy="20.5" r="1.3" />
    </svg>
  );
}

function IconList({ className = "h-9 w-9", strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </svg>
  );
}

function IconCalendar({ className = "h-9 w-9", strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="15" rx="1" />
      <path d="M4 10h16" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

function IconBook({ className = "h-9 w-9", strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5Z" />
    </svg>
  );
}

function IconAuto({ className = "h-9 w-9", strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />
    </svg>
  );
}
