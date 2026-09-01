import type { RunAutomationResult } from "@/lib/automation-core";

// Dispara el workflow de GitHub Actions que corre el robot de compra (ver
// .github/workflows/lacomer-order.yml) para un usuario específico, vía la API de GitHub
// (workflow_dispatch). Se usa desde runLacomerOrder cuando la app corre en Vercel, donde
// Playwright no puede correr directo.
//
// Necesita estas variables de entorno en Vercel (ver README, sección "Dónde corre el robot"):
//   LACOMER_ROBOT_GITHUB_TOKEN  — Personal Access Token con permiso "Actions: write" sobre el repo.
//   LACOMER_ROBOT_GITHUB_REPO   — "usuario/repositorio", ej. "eportill92-crypto/supercasa".
//   LACOMER_ROBOT_GITHUB_REF    — rama donde vive el workflow (default "main").
export async function dispatchLacomerOrderWorkflow(userId: string): Promise<RunAutomationResult> {
  const token = process.env.LACOMER_ROBOT_GITHUB_TOKEN;
  const repo = process.env.LACOMER_ROBOT_GITHUB_REPO;
  const ref = process.env.LACOMER_ROBOT_GITHUB_REF || "main";
  const workflowFile = "lacomer-order.yml";

  if (!token || !repo) {
    return {
      logId: "",
      success: false,
      message:
        "El robot de compra automática todavía no está configurado en este servidor (faltan LACOMER_ROBOT_GITHUB_TOKEN / LACOMER_ROBOT_GITHUB_REPO). Mientras tanto, registra el pedido manualmente con \"Ya lo compré manualmente\".",
    };
  }

  const res = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ ref, inputs: { userId } }),
    }
  );

  if (res.status === 204) {
    return {
      logId: "",
      success: true,
      message:
        "Se mandó a pedir. El robot corre en unos minutos en GitHub Actions — revisa el Historial más abajo cuando termine.",
    };
  }

  const body = await res.text().catch(() => "");
  return {
    logId: "",
    success: false,
    message: `No se pudo iniciar el robot (GitHub respondió ${res.status}). ${body}`.trim(),
  };
}
