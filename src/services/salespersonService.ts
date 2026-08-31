import type { SalespersonDetail } from '@/types/salespersonDetail';

const API_BASE = import.meta.env.VITE_API_BASE;

export async function getSalespersonDetail(id: number, from: string, to: string): Promise<SalespersonDetail> {
  const res = await fetch(`${API_BASE}/salesperson/${id}?startDate=${from}&endDate=${to}`);
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
}
