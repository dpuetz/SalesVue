import type { Product } from '@/types/product';
import type { PagedResult } from '@/types/order';

const API_BASE = import.meta.env.VITE_API_BASE;

export async function getProducts(page: number, pageSize: number): Promise<PagedResult<Product>> {
  const response = await fetch(`${API_BASE}/products?page=${page}&pageSize=${pageSize}`);
  if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);
  return response.json();
}
