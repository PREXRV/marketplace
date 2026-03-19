const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

interface RequestOptions extends RequestInit {
  revalidate?: number
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {

  const { revalidate = 60, ...fetchOptions } = options

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      Authorization: `Bearer ${localStorage.getItem("access") || ""}`,
      ...(fetchOptions.headers || {})
    },
    next: { revalidate }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error: ${text}`)
  }

  return res.json()
}