"use server";

import Anthropic from "@anthropic-ai/sdk";
import { requireUserId } from "@/lib/session";

const client = new Anthropic();

// Haiku 4.5: el modelo más barato de Claude, de sobra para leer una receta de una
// foto/PDF/página web y devolver los campos estructurados — no hace falta un modelo
// más caro para esta tarea.
const MODEL = "claude-haiku-4-5";

export type ExtractedRecipe = {
  name: string;
  servings: number;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string;
  suggestedCategory: string;
};

const EXTRACTION_PROMPT = `Analiza esta receta de cocina y responde ÚNICAMENTE con JSON válido, sin texto antes ni después, exactamente con esta forma:
{
  "name": "nombre de la receta",
  "servings": 4,
  "ingredients": [{"name": "nombre del ingrediente", "quantity": 1, "unit": "pza, kg, g, L, ml, taza, cucharada, etc."}],
  "instructions": "los pasos de preparación, resumidos en un párrafo",
  "suggestedCategory": "una de estas categorías, la que mejor le quede: Desayunos, Comidas, Cenas, Snacks, Antiinflamatorio"
}
Si no se especifican las porciones, estímalas del contexto (por default 4).`;

function normalizeImageMediaType(type: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  if (type === "image/png" || type === "image/gif" || type === "image/webp") return type;
  return "image/jpeg";
}

function parseRecipeResponse(text: string): ExtractedRecipe {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No se pudo leer la receta — intenta con una foto más clara.");

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(match[0]);
  } catch {
    throw new Error("No se pudo leer la receta — intenta de nuevo.");
  }

  if (!data.name || !Array.isArray(data.ingredients)) {
    throw new Error("No se detectó una receta clara en esto — agrégala a mano mejor.");
  }

  const ingredients = (data.ingredients as Record<string, unknown>[])
    .map((i) => ({
      name: String(i.name ?? "").trim(),
      quantity: Number(i.quantity) > 0 ? Number(i.quantity) : 1,
      unit: String(i.unit ?? "pza").trim() || "pza",
    }))
    .filter((i) => i.name);

  if (ingredients.length === 0) {
    throw new Error("No se detectaron ingredientes — agrégala a mano mejor.");
  }

  return {
    name: String(data.name).trim(),
    servings: Number(data.servings) > 0 ? Math.round(Number(data.servings)) : 4,
    ingredients,
    instructions: String(data.instructions ?? "").trim(),
    suggestedCategory: String(data.suggestedCategory ?? "Comidas").trim(),
  };
}

async function askClaude(content: Anthropic.MessageParam["content"]): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content }],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No se pudo leer la receta — intenta de nuevo.");
  }
  return textBlock.text;
}

export async function extractRecipeFromImage(formData: FormData): Promise<ExtractedRecipe> {
  await requireUserId();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Elige una foto primero");

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mediaType = normalizeImageMediaType(file.type);

  const text = await askClaude([
    { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
    { type: "text", text: EXTRACTION_PROMPT },
  ]);
  return parseRecipeResponse(text);
}

export async function extractRecipeFromPdf(formData: FormData): Promise<ExtractedRecipe> {
  await requireUserId();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Elige un PDF primero");

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  const text = await askClaude([
    { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
    { type: "text", text: EXTRACTION_PROMPT },
  ]);
  return parseRecipeResponse(text);
}

export async function extractRecipeFromLink(formData: FormData): Promise<ExtractedRecipe> {
  await requireUserId();
  const url = String(formData.get("url") ?? "").trim();
  if (!url) throw new Error("Pega un link primero");

  let html: string;
  try {
    const pageRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!pageRes.ok) throw new Error();
    html = await pageRes.text();
  } catch {
    throw new Error("No se pudo abrir ese link");
  }

  const pageText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15000);

  const text = await askClaude(
    `Este es el texto de una página web con una receta de cocina:\n\n${pageText}\n\n${EXTRACTION_PROMPT}`
  );
  return parseRecipeResponse(text);
}
