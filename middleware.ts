import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/login", "/registro"];

export default auth((req) => {
  const isPublic = PUBLIC_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));
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
  // la instalación por completo.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.png|apple-icon.png|sw.js|icons/).*)",
  ],
};
