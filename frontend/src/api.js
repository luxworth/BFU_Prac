export async function fetchNews() {
  const res = await fetch('/api/news');
  return res.json();
}

export async function fetchDeals() {
  const res = await fetch('/api/deals');
  return res.json();
} 