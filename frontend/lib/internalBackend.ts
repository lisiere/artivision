/**
 * URL du FastAPI (Render, ou `/_/backend` sur Vercel Services).
 * Doit rester aligné avec `next.config.mjs` (plus de rewrites : proxy via Route Handlers).
 */
export function resolveInternalBackendBaseUrl(): string {
  const explicit = process.env.INTERNAL_API_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercelHost = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercelHost) {
    return `https://${vercelHost}/_/backend`;
  }
  return "http://127.0.0.1:8000";
}

/**
 * Contourne la protection des déploiements Vercel pour les appels serveur → même projet
 * (ex. Next → service `/_/backend`). Vercel injecte `VERCEL_AUTOMATION_BYPASS_SECRET` quand
 * « Protection Bypass for Automation » est activé sur le projet.
 * @see https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
 */
export function vercelProtectionBypassHeaders(): Record<string, string> {
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  if (!secret) return {};
  return { "x-vercel-protection-bypass": secret };
}
