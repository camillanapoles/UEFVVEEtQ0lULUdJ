// Storage criptografado via Web Crypto API (AES-GCM).
// Opcional: se o usuário definir uma senha, as respostas ficam cifradas no localStorage.
// Sem senha, salva em texto normal.

const STORAGE_KEY = "pauta-cit-respostas-v2";
const SALT_KEY = "pauta-cit-salt-v2";

// Deriva chave AES de uma senha
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function getSalt() {
  let saltB64 = localStorage.getItem(SALT_KEY);
  if (saltB64) {
    return Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(SALT_KEY, btoa(String.fromCharCode(...salt)));
  return salt;
}

export async function saveAnswers(answers, password) {
  const json = JSON.stringify(answers);
  if (!password) {
    localStorage.setItem(STORAGE_KEY, json);
    return;
  }
  const salt = getSalt();
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(json);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const blob = {
    __enc: true,
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...new Uint8Array(cipher)))
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
}

export async function loadAnswers(password) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.__enc) return parsed;
    if (!password) throw new Error("Senha necessária para decodificar respostas salvas.");
    const salt = getSalt();
    const key = await deriveKey(password, salt);
    const iv = Uint8Array.from(atob(parsed.iv), (c) => c.charCodeAt(0));
    const data = Uint8Array.from(atob(parsed.data), (c) => c.charCodeAt(0));
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return JSON.parse(new TextDecoder().decode(plain));
  } catch (e) {
    console.error("Falha ao carregar respostas:", e);
    throw e;
  }
}

export function clearAnswers() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SALT_KEY);
}

export function exportAnswersAsJson(answers, questions) {
  const output = {
    metadata: {
      app: "Pauta CIT AI TECH",
      exportedAt: new Date().toISOString(),
      version: "2.0.0"
    },
    respostas: Object.entries(answers).map(([qid, ans]) => ({
      pergunta_id: qid,
      pergunta: questions[qid]?.title || "",
      clausula: questions[qid]?.clause || "",
      resposta_selecionada: ans.selected || null,
      resposta_label: ans.label || null,
      tipo: ans.type || null,
      texto_aberto: ans.open_text || null,
      respondido_em: ans.timestamp || null
    }))
  };
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pauta-cit-respostas-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
