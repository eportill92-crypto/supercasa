"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";

const SECTIONS: {
  label: string;
  items: { href: string; label: string; icon: string; badge?: string }[];
}[] = [
  {
    label: "Tu súper",
    items: [
      { href: "/pedir-super", label: "Pedir el súper", icon: "🛒" },
      { href: "/inventario", label: "Mi despensa", icon: "🧺" },
      { href: "/lista-compra", label: "Mi lista", icon: "🧾" },
      { href: "/pedidos", label: "Pedidos", icon: "📋", badge: "Historial" },
      { href: "/configuracion#credenciales", label: "Mis credenciales", icon: "🔑", badge: "La Comer" },
    ],
  },
  {
    label: "Tu comida",
    items: [
      { href: "/recetas", label: "Recetario", icon: "📖", badge: "📷 Agregar con foto" },
      { href: "/menu-semanal", label: "Ver mi semana", icon: "📅" },
    ],
  },
  {
    label: "Cuenta",
    items: [{ href: "/configuracion", label: "Configuración", icon: "⚙️" }],
  },
];

export default function AccountMenu({ name, email }: { name: string | null; email: string }) {
  const [open, setOpen] = useState(false);
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú de cuenta"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:bg-black/5"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[300px] max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-black/5 px-5 py-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-lg font-extrabold text-brand-text">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{name || "Tu cuenta"}</div>
                <div className="truncate text-xs text-ink-soft">{email}</div>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
                className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-black/5"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {SECTIONS.map((section) => (
                <div key={section.label}>
                  <div className="px-5 pt-4 pb-1 text-[10.5px] font-extrabold uppercase tracking-wide text-ink-soft/80">
                    {section.label}
                  </div>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-ink transition hover:bg-black/5"
                    >
                      <span aria-hidden>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-mint-light px-2 py-0.5 text-[10px] font-extrabold text-mint-text">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <form action={logoutAction} className="border-t border-black/5 px-5 py-4">
              <button type="submit" className="text-sm font-bold text-berry-text">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
