"use server";

import { prisma } from "@/lib/prisma";

export type SubmitLandingLeadResult = { ok: true } | { ok: false; error: string };

// Formulario de contacto de la página informativa pública (sin sesión). Siempre se guarda el
// registro aunque el aviso por correo no esté configurado todavía (ver notifyLead).
export async function submitLandingLead(formData: FormData): Promise<SubmitLandingLeadResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) return { ok: false, error: "Escribe tu nombre." };
  if (!email.includes("@")) return { ok: false, error: "Escribe un correo válido." };

  const lead = await prisma.landingLead.create({
    data: { name, email, phone: phone || undefined },
  });

  try {
    await notifyLead(lead);
  } catch (err) {
    console.error("No se pudo notificar el lead por correo:", err);
  }

  return { ok: true };
}

// El destino del aviso (RESEND_API_KEY + LEAD_NOTIFICATION_EMAIL) todavía no está configurado —
// mientras tanto esta función no hace nada y el lead solo queda guardado en la base de datos.
async function notifyLead(lead: { id: string; name: string; email: string; phone: string | null }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "SuperCasa <onboarding@resend.dev>",
    to,
    subject: `Nuevo contacto desde la página: ${lead.name}`,
    text: `Nombre: ${lead.name}\nCorreo: ${lead.email}\nTeléfono: ${lead.phone ?? "(no proporcionado)"}`,
  });

  await prisma.landingLead.update({ where: { id: lead.id }, data: { notifiedAt: new Date() } });
}
