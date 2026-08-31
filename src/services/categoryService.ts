import type { CategorySales } from '@/types/category';

const API_BASE = import.meta.env.VITE_API_BASE;

export async function getCategorySales(startDate: string, endDate: string): Promise<CategorySales[]> {
  const response = await fetch(`${API_BASE}/category?startDate=${startDate}&endDate=${endDate}`);
  if (!response.ok) throw new Error(`Failed to fetch category sales: ${response.statusText}`);
  return response.json();
}
