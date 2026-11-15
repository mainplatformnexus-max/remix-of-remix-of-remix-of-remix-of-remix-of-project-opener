/**
 * One developer API token for the public content API (/api/public/v1).
 * The admin creates it in Dashboard → Settings; only its SHA-256 hash is
 * stored (Firestore `app_settings/api_token`), so the readable settings
 * document never reveals the token itself.
 */
export const API_TOKEN_KEY = "api_token";

export type ApiTokenSetting = { hash: string; last4: string; created_at: string };

const FIRESTORE_DOC =
  "https://firestore.googleapis.com/v1/projects/luo-film-2026/databases/(default)/documents/app_settings/api_token?key=AIzaSyBTSFk7GSITIHQ9WxSdi1BoVvcr4FXuZe0";
const CACHE_MS = 60_000;

/** Reads the token from `Authorization: Bearer`, `X-API-Key`, or `?api_key=` / `?token=`. */
export function extractApiToken(request: Request): string | null {
  const auth = request.headers.get("authorization")?.trim();
  if (auth && /^bearer\s+/i.test(auth)) return auth.replace(/^bearer\s+/i, "").trim() || null;
  const header = request.headers.get("x-api-key")?.trim();
  if (header) return header;
  const q = new URL(request.url).searchParams;
  return (q.get("api_key") ?? q.get("token"))?.trim() || null;
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** New random token: `mmx_` + 48 hex characters. */
export function newApiToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return `mmx_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export async function tokenMatches(token: string | null, hash: string | null | undefined): Promise<boolean> {
  if (!token || !hash || token.length > 200) return false;
  const got = await sha256Hex(token);
  if (got.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

/* ---------- server-side read of the stored hash ---------- */

type Stored = { hash: string | null } | undefined; // undefined = could not read
let cached: { hash: string | null; at: number } | null = null;

async function readStoredHash(): Promise<Stored> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch(FIRESTORE_DOC, { signal: ctrl.signal });
    if (res.status === 404) return { hash: null };
    if (!res.ok) return undefined;
    const json = (await res.json()) as {
      fields?: { value?: { mapValue?: { fields?: { hash?: { stringValue?: string } } } } };
    };
    const hash = json.fields?.value?.mapValue?.fields?.hash?.stringValue;
    return { hash: hash && /^[0-9a-f]{64}$/.test(hash) ? hash : null };
  } catch {
    return undefined;
  } finally {
    clearTimeout(t);
  }
}

/** Stored token hash; `null` when no token is set, `undefined` when it can't be checked. */
export async function getApiTokenHash(): Promise<string | null | undefined> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.hash;
  const stored = await readStoredHash();
  if (stored) {
    cached = { hash: stored.hash, at: Date.now() };
    return stored.hash;
  }
  return cached?.hash ?? undefined; // keep last good value when Firestore is unreachable
}

export function resetApiTokenCache() {
  cached = null;
}

/** Returns an error Response when the request is not allowed, otherwise null. */
export async function checkApiAccess(
  request: Request,
  headers: Record<string, string>,
): Promise<Response | null> {
  const hash = await getApiTokenHash();
  const fail = (error: string, status: number) =>
    Response.json({ ok: false, error }, { status, headers: { ...headers, "cache-control": "no-store" } });
  if (hash === undefined) return fail("API token could not be checked — retry shortly", 503);
  if (hash === null) return fail("API token not created yet — ask the MOVIE MAX admin", 503);
  if (!(await tokenMatches(extractApiToken(request), hash))) return fail("Invalid or missing API token", 401);
  return null;
}
