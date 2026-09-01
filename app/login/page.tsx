export const dynamic = "force-dynamic";

import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-2xl">
          🛒
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">SuperCasa</h1>
        <p className="mt-1 text-sm text-ink-soft">Inicia sesión para ver tu despensa.</p>
      </div>
      <div className="card">
        <LoginForm callbackUrl={params.callbackUrl ?? "/"} />
      </div>
      <p className="text-center text-sm text-ink-soft">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-bold text-brand underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
