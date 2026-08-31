import type { Customer } from '@/types/customer';
import type { PagedResult } from '@/types/order';
import type { CustomerDetail } from '@/types/customerDetail';

const API_BASE = import.meta.env.VITE_API_BASE;

export async function getCustomers(
  page: number,
  pageSize: number,
  search?: string,
  sortBy?: string,
  sortDir?: string,
): Promise<PagedResult<Customer>> {
  const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDir) params.append('sortDir', sortDir);

  const response = await fetch(`${API_BASE}/customers?${params}`);
  if (!response.ok) throw new Error(`Failed to fetch customers: ${response.statusText}`);
  return response.json();
}

export async function getCustomerDetail(id: string, from: string, to: string): Promise<CustomerDetail> {
  const response = await fetch(`${API_BASE}/customers/${id}?from=${from}&to=${to}`);
  if (!response.ok) throw new Error('fetch failed');
  return response.json();
}
