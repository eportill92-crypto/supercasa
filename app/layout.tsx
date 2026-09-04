import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import AccountMenu from "@/components/AccountMenu";
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
  themeColor: "#26449e",
};

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
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
                <Image src="/icon.png" alt="" width={32} height={32} />
              </span>
              <span>Super<span className="text-brand">Casa</span></span>
            </Link>
            <div className="flex shrink-0 items-center gap-3 text-sm">
              {session?.user ? (
                <AccountMenu name={session.user.name ?? null} email={session.user.email ?? ""} />
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
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">{children}</main>
        <footer className="border-t border-black/5 py-6 text-center text-xs text-ink-soft">
          🛒 SuperCasa — inventario y pedidos automáticos para lacomer.com.mx
        </footer>
      </body>
    </html>
  );
}
