import { createAuthClient } from "@neondatabase/neon-js/auth";

export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL);

export async function getBearerToken() {
  const result = await authClient.token();
  if (result.error) throw new Error(result.error.message || "Não foi possível obter a sessão.");
  return result.data?.token || null;
}

export async function apiFetch(path, options = {}) {
  const token = await getBearerToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir a operação.");
  return data;
}
