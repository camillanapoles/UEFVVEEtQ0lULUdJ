// Wrapper fino sobre tokens.js, preservando a API antiga usada pelo App.
import { hasTokens, validateAndUnlock, hasSessionMasterKey, clearSessionMasterKey } from "./tokens";

export function isAccessRequired() {
  // Sempre exigimos token assim que ao menos um foi gerado.
  // Se nenhum token existe, entra no fluxo de bootstrap (primeira execução).
  return hasTokens();
}

export function hasValidSession() {
  return hasSessionMasterKey();
}

export async function validateToken(token) {
  const key = await validateAndUnlock(token);
  return !!key;
}

export function clearSession() {
  clearSessionMasterKey();
}
