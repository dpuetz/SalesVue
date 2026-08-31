import type {
  Order,
  PagedResult,
  OrderCustomerLookup,
  OrderSalespersonLookup,
  OrderCountryLookup,
  OrderDetail,
  OrderFilters,
  CountrySalesPerson,
  CountryCustomer,
} from '@/types/order';

const API_BASE = import.meta.env.VITE_API_BASE;

export async function getOrders(
  page: number,
  pageSize: number,
  filters: OrderFilters = {},
): Promise<PagedResult<Order>> {
  const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortDir) params.append('sortDir', filters.sortDir);
  if (filters.customerId) params.append('customerId', filters.customerId);
  if (filters.employeeId) params.append('employeeId', filters.employeeId.toString());
  if (filters.orderDateStart) params.append('orderDateStart', filters.orderDateStart);
  if (filters.orderDateEnd) params.append('orderDateEnd', filters.orderDateEnd);
  if (filters.shippedDateStart) params.append('shippedDateStart', filters.shippedDateStart);
  if (filters.shippedDateEnd) params.append('shippedDateEnd', filters.shippedDateEnd);
  if (filters.shipCountry) params.append('shipCountry', filters.shipCountry);

  const response = await fetch(`${API_BASE}/orders?${params}`);
  if (!response.ok) throw new Error(`Failed to fetch orders: ${response.statusText}`);
  return response.json();
}

export async function getOrderById(id: number): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch order: ${response.statusText}`);
  return response.json();
}

export async function getCustomerLookups(): Promise<OrderCustomerLookup[]> {
  const response = await fetch(`${API_BASE}/orders/lookups/customers`);
  if (!response.ok) throw new Error('Failed to fetch customer lookups');
  return response.json();
}

export async function getSalespersonLookups(): Promise<OrderSalespersonLookup[]> {
  const response = await fetch(`${API_BASE}/orders/lookups/salespersons`);
  if (!response.ok) throw new Error('Failed to fetch salesperson lookups');
  return response.json();
}

export async function getCountryLookups(): Promise<OrderCountryLookup[]> {
  const response = await fetch(`${API_BASE}/orders/lookups/countries`);
  if (!response.ok) throw new Error('Failed to fetch country lookups');
  return response.json();
}

export async function getOrderDetail(id: number): Promise<OrderDetail> {
  const response = await fetch(`${API_BASE}/orders/detail/${id}`);
  if (!response.ok) throw new Error('Failed to fetch order detail');
  return response.json();
}

export async function getCountrySalesPerson(
  country: string,
  from?: string,
  to?: string,
): Promise<CountrySalesPerson[]> {
  const params = new URLSearchParams({ country });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${API_BASE}/orders/country-salesperson?${params.toString()}`);
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
}

export async function getCountryCustomer(country: string, from?: string, to?: string): Promise<CountryCustomer[]> {
  const params = new URLSearchParams({ country });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${API_BASE}/orders/country-customer?${params.toString()}`);
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
}
