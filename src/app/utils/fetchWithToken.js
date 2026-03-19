export async function fetchWithToken(endpoint) {
  const token = localStorage.getItem('accessToken'); // достаём токен
  if (!token) throw new Error('Access token not found in localStorage');

  const res = await fetch(`/api/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Fetch failed');
  }

  return res.json();
}