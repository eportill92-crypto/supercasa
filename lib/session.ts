import { auth } from "@/auth";

// El middleware ya protege todas las rutas, así que esto solo debería fallar si algo llama
// a una server action directamente sin sesión (defensa adicional, no el camino esperado).
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No hay sesión activa");
  }
  return session.user.id;
}
