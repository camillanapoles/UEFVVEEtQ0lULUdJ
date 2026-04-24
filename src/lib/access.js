// Valida token de acesso comparando hash SHA-256 embutido no build.
// Se VITE_ACCESS_TOKEN_HASH estiver vazio, libera acesso direto.

async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const REQUIRED_HASH = import.meta.env.VITE_ACCESS_TOKEN_HASH || "";
const SESSION_KEY = "pauta-cit-access-ok";

export function isAccessRequired() {
  return REQUIRED_HASH.length > 0;
}

export function hasValidSession() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export async function validateToken(token) {
  if (!REQUIRED_HASH) return true;
  const hash = await sha256Hex(token);
  const ok = hash === REQUIRED_HASH;
  if (ok) sessionStorage.setItem(SESSION_KEY, "1");
  return ok;
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
