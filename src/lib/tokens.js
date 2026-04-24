// Sistema FIFO de tokens de acesso (máx. 5) com chave mestra persistida.
//
// Desenho:
//  - Existe UMA chave mestra AES-GCM (masterKey) que cifra as respostas.
//  - Cada token válido envolve (wrap) a mesma chave mestra: assim,
//    qualquer um dos 5 tokens consegue decifrar as respostas.
//  - Gerar novo token: se a FIFO está cheia, o mais antigo é expulso.
//  - Bootstrap: primeira execução cria masterKey + primeiro token.
//
// Storage:
//   localStorage["pauta-cit-tokens"] = [
//     { id, hash, createdAt, salt, iv, wrapped }, ...
//   ]  (máx. 5 entradas)
//
// Fluxo de acesso:
//   1. Usuário digita token.
//   2. Hash SHA-256 bate com alguma entrada → deriva key, unwrap masterKey.
//   3. masterKey fica em sessionStorage (exportada) para storage.js usar.

const TOKENS_KEY = "pauta-cit-tokens-v1";
const SESSION_MASTER_KEY = "pauta-cit-session-master";
const MAX_TOKENS = 5;

const enc = new TextEncoder();

function b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function fromB64(str) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

async function sha256Hex(str) {
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(str));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function deriveWrapKey(tokenPlain, salt) {
  const material = await crypto.subtle.importKey(
    "raw", enc.encode(tokenPlain), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["wrapKey", "unwrapKey"]
  );
}

function loadFifo() {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFifo(list) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
}

export function hasTokens() {
  return loadFifo().length > 0;
}

export function listTokensMeta() {
  return loadFifo().map(({ id, hash, createdAt }) => ({
    id, hash: hash.slice(0, 8), createdAt
  }));
}

// Gera string aleatória (24 caracteres alfanuméricos) — entropia ~143 bits
export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return b64(bytes).replace(/[+/=]/g, "").slice(0, 24);
}

// Bootstrap: cria masterKey + primeiro token. Retorna { token, masterKey }.
async function bootstrapFirstToken() {
  const masterKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
  );
  const token = randomToken();
  const entry = await wrapMasterKeyForToken(masterKey, token);
  saveFifo([entry]);
  return { token, masterKey };
}

async function wrapMasterKeyForToken(masterKey, tokenPlain) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrapKey = await deriveWrapKey(tokenPlain, salt);
  const wrapped = await crypto.subtle.wrapKey("raw", masterKey, wrapKey, { name: "AES-GCM", iv });
  return {
    id: crypto.randomUUID(),
    hash: await sha256Hex(tokenPlain),
    createdAt: new Date().toISOString(),
    salt: b64(salt),
    iv: b64(iv),
    wrapped: b64(wrapped)
  };
}

async function unwrapMasterKey(entry, tokenPlain) {
  const salt = fromB64(entry.salt);
  const iv = fromB64(entry.iv);
  const wrapped = fromB64(entry.wrapped);
  const wrapKey = await deriveWrapKey(tokenPlain, salt);
  return crypto.subtle.unwrapKey(
    "raw", wrapped, wrapKey,
    { name: "AES-GCM", iv },
    { name: "AES-GCM", length: 256 },
    true, ["encrypt", "decrypt"]
  );
}

// Gera e persiste um novo token. Precisa do token atual válido para
// desembalar a masterKey e re-embalar sob o token novo.
// Se não há nenhum token ainda, faz bootstrap.
export async function generateNewToken(currentTokenPlain) {
  const fifo = loadFifo();

  if (fifo.length === 0) {
    const { token } = await bootstrapFirstToken();
    return token;
  }

  if (!currentTokenPlain) {
    throw new Error("É preciso um token válido atual para gerar um novo.");
  }
  const currentHash = await sha256Hex(currentTokenPlain);
  const currentEntry = fifo.find((e) => e.hash === currentHash);
  if (!currentEntry) throw new Error("Token atual inválido.");
  const masterKey = await unwrapMasterKey(currentEntry, currentTokenPlain);

  const newToken = randomToken();
  const newEntry = await wrapMasterKeyForToken(masterKey, newToken);
  const next = [...fifo, newEntry];
  while (next.length > MAX_TOKENS) next.shift(); // FIFO: mais antigo expulso
  saveFifo(next);
  return newToken;
}

// Valida token de acesso. Se bater, retorna masterKey e cacheia em sessão.
export async function validateAndUnlock(tokenPlain) {
  const fifo = loadFifo();
  if (fifo.length === 0) return null;
  const hash = await sha256Hex(tokenPlain);
  const entry = fifo.find((e) => e.hash === hash);
  if (!entry) return null;
  const masterKey = await unwrapMasterKey(entry, tokenPlain);
  await cacheSessionMasterKey(masterKey);
  return masterKey;
}

async function cacheSessionMasterKey(masterKey) {
  const raw = await crypto.subtle.exportKey("raw", masterKey);
  sessionStorage.setItem(SESSION_MASTER_KEY, b64(raw));
}

export async function getSessionMasterKey() {
  const raw = sessionStorage.getItem(SESSION_MASTER_KEY);
  if (!raw) return null;
  return crypto.subtle.importKey(
    "raw", fromB64(raw), { name: "AES-GCM", length: 256 },
    false, ["encrypt", "decrypt"]
  );
}

export function hasSessionMasterKey() {
  return !!sessionStorage.getItem(SESSION_MASTER_KEY);
}

export function clearSessionMasterKey() {
  sessionStorage.removeItem(SESSION_MASTER_KEY);
}

// Reseta tudo (inclui respostas, por serem indecifráveis sem masterKey).
export function purgeAll() {
  localStorage.removeItem(TOKENS_KEY);
  sessionStorage.removeItem(SESSION_MASTER_KEY);
}

// Usado no primeiro boot para criar o primeiro token e já logar na sessão.
export async function bootstrapAndUnlock() {
  const { token, masterKey } = await bootstrapFirstToken();
  await cacheSessionMasterKey(masterKey);
  return token;
}
