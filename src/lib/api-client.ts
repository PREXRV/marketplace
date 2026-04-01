const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://fulfilling-success-production-3288.up.railway.app/api';

interface RequestOptions extends RequestInit {
  revalidate?: number;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { revalidate = 60, ...fetchOptions } = options;

  const isFormData = fetchOptions.body instanceof FormData;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(fetchOptions.headers || {}),
    },
    next: { revalidate },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${text}`);
  }

  return res.json();
}