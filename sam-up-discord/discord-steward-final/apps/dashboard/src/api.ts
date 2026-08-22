const PASSWORD_KEY = "discord-steward-dashboard-password";

export function getPassword(): string {
  return sessionStorage.getItem(PASSWORD_KEY) ?? "";
}

export function setPassword(value: string): void {
  sessionStorage.setItem(PASSWORD_KEY, value);
}

export function clearPassword(): void {
  sessionStorage.removeItem(PASSWORD_KEY);
}

export async function api<T>(path: string, options: {method?: string; body?: unknown} = {}): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "x-dashboard-password": getPassword(),
      ...(options.body ? {"content-type": "application/json"} : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const body = await response.json().catch(() => ({error: `HTTP ${response.status}`}));
  if (!response.ok) throw new Error(body?.error ?? `HTTP ${response.status}`);
  return body as T;
}
