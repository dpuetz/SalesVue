import type { DashboardData, CountrySales } from '@/types/dashboard';

const API_BASE = import.meta.env.VITE_API_BASE;

export async function getDashboardData(startDate: string | null, endDate: string | null): Promise<DashboardData> {
  const response = await fetch(`${API_BASE}/dashboard?startDate=${startDate}&endDate=${endDate}`);
  if (!response.ok) throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  return response.json();
}

export async function getSalesByCountry(startDate: string | null, endDate: string | null): Promise<CountrySales[]> {
  const response = await fetch(`${API_BASE}/dashboard/sales-by-country?startDate=${startDate}&endDate=${endDate}`);
  if (!response.ok) throw new Error(`Failed to fetch sales by country: ${response.statusText}`);
  return response.json();
}
