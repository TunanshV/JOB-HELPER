export type JobMatch = {
  id: string;
  company: string;
  title: string;
  location: string;
  matchScore: number;
  source: 'mock';
};

const mockMatches: JobMatch[] = [
  { id: 'linear-product-data-analyst', company: 'Linear', title: 'Product Data Analyst', location: 'Remote', matchScore: 96, source: 'mock' },
  { id: 'vercel-analytics-engineer', company: 'Vercel', title: 'Analytics Engineer', location: 'New York, NY', matchScore: 91, source: 'mock' },
  { id: 'notion-data-platform-engineer', company: 'Notion', title: 'Data Platform Engineer', location: 'San Francisco, CA', matchScore: 87, source: 'mock' },
];

export function getJobMatches(): JobMatch[] {
  return mockMatches;
}

// Replace this adapter with an official API or licensed feed. Do not scrape sites that prohibit it.
