import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/login", "/registro"];

// "/" también es pública: a quien no tiene sesión le mostramos una página informativa en vez
// de mandarlo directo a /login (ver app/page.tsx — ahí decide qué mostrar según la sesión).
// Comparación exacta (no startsWith) para no volver pública toda la app por accidente.
function isPublicPath(pathname: string) {
  return pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export default auth((req) => {
  const isPublic = isPublicPath(req.nextUrl.pathname);
  if (!req.auth && !isPublic) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
});

export const config = {
  // manifest.webmanifest/icon.png/apple-icon.png/sw.js/icons/ también deben quedar fuera: los
  // pide el navegador sin sesión (ej. al evaluar si puede ofrecer "Instalar" la PWA), y sin esta
  // excepción el middleware los redirigía a /login en vez de servir el archivo real, rompiendo
  // la instalación por completo. landing-screenshot.png es la captura de la app que usa la
  // página informativa pública — mismo problema si no queda excluida.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.png|apple-icon.png|sw.js|icons/|landing-screenshot.png).*)",
  ],
};
