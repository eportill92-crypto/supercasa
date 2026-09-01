"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

export async function saveLacomerCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    throw new Error("Correo y contraseña son obligatorios");
  }

  await prisma.credential.upsert({
    where: { provider: "lacomer" },
    update: { emailEnc: encrypt(email), passwordEnc: encrypt(password) },
    create: { provider: "lacomer", emailEnc: encrypt(email), passwordEnc: encrypt(password) },
  });

  revalidatePath("/configuracion");
}

export async function clearLacomerCredentials() {
  await prisma.credential.deleteMany({ where: { provider: "lacomer" } });
  revalidatePath("/configuracion");
}

export async function hasLacomerCredentials(): Promise<{ configured: boolean; emailMasked?: string }> {
  const cred = await prisma.credential.findUnique({ where: { provider: "lacomer" } });
  if (!cred) return { configured: false };
  // No desciframos aquí para no exponer el email completo en una vista de solo lectura.
  return { configured: true };
}

export async function saveDeliveryAddress(formData: FormData) {
  const street = String(formData.get("street") ?? "").trim();
  const extNumber = String(formData.get("extNumber") ?? "").trim() || null;
  const intNumber = String(formData.get("intNumber") ?? "").trim() || null;
  const neighborhood = String(formData.get("neighborhood") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const zip = String(formData.get("zip") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!street || !city || !state || !zip) {
    throw new Error("Calle, ciudad, estado y código postal son obligatorios");
  }

  const existing = await prisma.deliveryAddress.findFirst({ where: { isDefault: true } });

  if (existing) {
    await prisma.deliveryAddress.update({
      where: { id: existing.id },
      data: { street, extNumber, intNumber, neighborhood, city, state, zip, phone },
    });
  } else {
    await prisma.deliveryAddress.create({
      data: { street, extNumber, intNumber, neighborhood, city, state, zip, phone, isDefault: true },
    });
  }

  revalidatePath("/configuracion");
}

export async function getDefaultAddress() {
  return prisma.deliveryAddress.findFirst({ where: { isDefault: true } });
}
