const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function getRecommendedJobs() {
  const response = await fetch(`${apiUrl}/jobs/recommended`);
  if (!response.ok) throw new Error('Could not load job recommendations.');
  return response.json() as Promise<{ matches: unknown[] }>;
}
