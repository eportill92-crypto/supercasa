import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions/auth";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuperCasa",
  description: "Inventario de despensa y pedidos automáticos a La Comer",
  appleWebApp: {
    // Le dice a iOS que al agregarla a pantalla de inicio abra en modo app (sin la barra del
    // navegador) en vez de como un simple acceso directo a Safari.
    capable: true,
    title: "SuperCasa",
    statusBarStyle: "default",
  },
};

// La app solo tiene tema claro por ahora. Sin esto, algunos navegadores móviles (ej. "Forzar
// oscuro" de Chrome en Android) reinterpretan los colores fijos de la página y dejan texto
// invisible sobre fondo negro. themeColor pinta la barra de estado/título del navegador (y de
// la app instalada) del azul de marca en vez del gris/blanco por default.
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#2563eb",
};

const NAV_LINKS = [
  { href: "/", label: "Inicio", icon: "🏠", hover: "hover:bg-brand-light hover:text-brand-text" },
  { href: "/inventario", label: "Inventario", icon: "📦", hover: "hover:bg-mint-light hover:text-mint-text" },
  { href: "/lista-compra", label: "Lista de compra", icon: "🛒", hover: "hover:bg-brand-light hover:text-brand-text" },
  { href: "/pedidos", label: "Pedidos", icon: "📋", hover: "hover:bg-mint-light hover:text-mint-text" },
  { href: "/menu-semanal", label: "Menú semanal", icon: "📅", hover: "hover:bg-brand-light hover:text-brand-text" },
  { href: "/recetas", label: "Recetas", icon: "🍳", hover: "hover:bg-mint-light hover:text-mint-text" },
  { href: "/configuracion", label: "Configuración", icon: "⚙️", hover: "hover:bg-black/5 hover:text-ink" },
];

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <RegisterServiceWorker />
        <header className="sticky top-0 z-10 border-b border-black/5 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-base">
                  🛒
                </span>
                Super<span className="text-brand">Casa</span>
              </Link>
              <div className="flex shrink-0 items-center gap-2 text-sm">
                {session?.user ? (
                  <>
                    <span className="hidden text-ink-soft sm:inline">{session.user.email}</span>
                    <form action={logoutAction}>
                      <button type="submit" className="btn-ghost">
                        Cerrar sesión
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="btn-ghost">
                      Iniciar sesión
                    </Link>
                    <Link href="/registro" className="btn-primary">
                      Crear cuenta
                    </Link>
                  </>
                )}
              </div>
            </div>
            {session?.user && (
              <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 text-sm sm:mx-0 sm:flex-wrap sm:px-0">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold text-ink-soft transition ${link.hover}`}
                  >
                    <span aria-hidden>{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">{children}</main>
        <footer className="border-t border-black/5 py-6 text-center text-xs text-ink-soft">
          🛒 SuperCasa — inventario y pedidos automáticos para lacomer.com.mx
        </footer>
      </body>
    </html>
  );
}
