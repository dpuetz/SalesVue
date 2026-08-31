import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCustomers, getCustomerDetail } from '@/services/customerService'
import type { Customer } from '@/types/customer'
import type { PagedResult } from '@/types/order'
import type { CustomerDetail } from '@/types/customerDetail'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockCustomer: Customer = {
  customerId: 'ALFKI',
  companyName: 'Alfreds Futterkiste',
  contactName: 'Maria Anders',
  contactTitle: 'Sales Representative',
  phone: '030-0074321',
  city: 'Berlin',
  country: 'Germany',
}

const mockPagedResult: PagedResult<Customer> = {
  data: [mockCustomer],
  totalCount: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
}

const mockCustomerDetail: CustomerDetail = {
  customerId: 'ALFKI',
  customerName: 'Alfreds Futterkiste',
  city: 'Berlin',
  country: 'Germany',
  kpis: {
    totalRevenue: 4596.2,
    totalOrders: 6,
    avgOrderValue: 766.03,
    shippedOrders: 5,
    pendingOrders: 1,
  },
  revenueByMonth: [
    { month: 1, revenue: 1200 },
    { month: 2, revenue: 3396.2 },
  ],
  orders: [
    {
      orderId: 10643,
      orderDate: '1997-08-25T00:00:00',
      orderTotal: 814.5,
      status: 'Shipped',
      salesperson: 'Janet Leverling',
    },
  ],
  salespersonBreakdown: [
    {
      employeeId: 3,
      salesPerson: 'Janet Leverling',
      revenue: 4596.2,
      orderCount: 6,
    },
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Creates a fetch mock that resolves with the given payload and status. */
function mockFetchOk(payload: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: vi.fn().mockResolvedValue(payload),
  })
}

/** Creates a fetch mock that resolves with a non-ok response. */
function mockFetchError(status: number, statusText: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
    json: vi.fn().mockResolvedValue({}),
  })
}

/** Creates a fetch mock that rejects entirely (network failure). */
function mockFetchNetworkFailure(message = 'Network Error') {
  return vi.fn().mockRejectedValue(new TypeError(message))
}

/** Extracts the URL passed to the first fetch call as a URL object. */
function calledUrl(): URL {
  return new URL((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

// VITE_API_BASE is set to 'http://localhost:5000/api' in vitest.config.ts → test.env
// It must live there (not in vi.stubEnv) because the module captures it at load time.
const API_BASE = 'http://localhost:5000/api'

describe('customerApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── getCustomers ────────────────────────────────────────────────────────────

  describe('getCustomers', () => {
    describe('happy path', () => {
      it('calls the correct URL with page and pageSize', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getCustomers(1, 10)

        expect(fetch).toHaveBeenCalledOnce()
        const url = calledUrl()
        expect(url.origin + url.pathname).toBe(`${API_BASE}/customers`)
        expect(url.searchParams.get('page')).toBe('1')
        expect(url.searchParams.get('pageSize')).toBe('10')
      })

      it('appends optional search param when provided', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getCustomers(1, 10, 'Alfreds')

        expect(calledUrl().searchParams.get('search')).toBe('Alfreds')
      })

      it('does not append search param when omitted', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getCustomers(1, 10)

        expect(calledUrl().searchParams.has('search')).toBe(false)
      })

      it('appends sortBy and sortDir when provided', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getCustomers(2, 25, undefined, 'companyName', 'asc')

        const url = calledUrl()
        expect(url.searchParams.get('sortBy')).toBe('companyName')
        expect(url.searchParams.get('sortDir')).toBe('asc')
      })

      it('omits sortBy and sortDir when not provided', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getCustomers(1, 10)

        const url = calledUrl()
        expect(url.searchParams.has('sortBy')).toBe(false)
        expect(url.searchParams.has('sortDir')).toBe(false)
      })

      it('returns the parsed JSON response', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        const result = await getCustomers(1, 10)

        expect(result).toEqual(mockPagedResult)
      })

      it('handles an empty data array', async () => {
        const empty: PagedResult<Customer> = {
          data: [],
          totalCount: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        }
        vi.stubGlobal('fetch', mockFetchOk(empty))

        const result = await getCustomers(1, 10)

        expect(result.data).toHaveLength(0)
        expect(result.totalCount).toBe(0)
      })

      it('handles a multi-page result', async () => {
        const multiPage: PagedResult<Customer> = {
          data: [mockCustomer],
          totalCount: 100,
          page: 3,
          pageSize: 10,
          totalPages: 10,
        }
        vi.stubGlobal('fetch', mockFetchOk(multiPage))

        const result = await getCustomers(3, 10)

        expect(result.totalPages).toBe(10)
        expect(result.page).toBe(3)
      })

      it('encodes special characters in the search param', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getCustomers(1, 10, 'Müller & Co')

        expect(calledUrl().searchParams.get('search')).toBe('Müller & Co')
      })
    })

    describe('error handling', () => {
      it('throws with statusText on a 400 response', async () => {
        vi.stubGlobal('fetch', mockFetchError(400, 'Bad Request'))

        await expect(getCustomers(1, 10)).rejects.toThrow('Failed to fetch customers: Bad Request')
      })

      it('throws with statusText on a 404 response', async () => {
        vi.stubGlobal('fetch', mockFetchError(404, 'Not Found'))

        await expect(getCustomers(1, 10)).rejects.toThrow('Failed to fetch customers: Not Found')
      })

      it('throws with statusText on a 500 response', async () => {
        vi.stubGlobal('fetch', mockFetchError(500, 'Internal Server Error'))

        await expect(getCustomers(1, 10)).rejects.toThrow(
          'Failed to fetch customers: Internal Server Error',
        )
      })

      it('propagates a network-level rejection', async () => {
        vi.stubGlobal('fetch', mockFetchNetworkFailure('Failed to fetch'))

        await expect(getCustomers(1, 10)).rejects.toThrow('Failed to fetch')
      })
    })
  })

  // ── getCustomerDetail ───────────────────────────────────────────────────────

  describe('getCustomerDetail', () => {
    describe('happy path', () => {
      it('calls the correct URL with id, from, and to', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockCustomerDetail))

        await getCustomerDetail('ALFKI', '2024-01-01', '2024-12-31')

        expect(fetch).toHaveBeenCalledOnce()
        const url = calledUrl()
        expect(url.origin + url.pathname).toBe(`${API_BASE}/customers/ALFKI`)
        expect(url.searchParams.get('from')).toBe('2024-01-01')
        expect(url.searchParams.get('to')).toBe('2024-12-31')
      })

      it('returns the parsed JSON response', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockCustomerDetail))

        const result = await getCustomerDetail('ALFKI', '2024-01-01', '2024-12-31')

        expect(result).toEqual(mockCustomerDetail)
      })

      it('returns kpis correctly', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockCustomerDetail))

        const result = await getCustomerDetail('ALFKI', '2024-01-01', '2024-12-31')

        expect(result.kpis.totalRevenue).toBe(4596.2)
        expect(result.kpis.totalOrders).toBe(6)
        expect(result.kpis.shippedOrders).toBe(5)
        expect(result.kpis.pendingOrders).toBe(1)
      })

      it('handles a salesperson with an undefined name', async () => {
        const detailWithUndefinedSalesperson: CustomerDetail = {
          ...mockCustomerDetail,
          salespersonBreakdown: [
            { employeeId: 99, salesPerson: undefined, revenue: 100, orderCount: 1 },
          ],
        }
        vi.stubGlobal('fetch', mockFetchOk(detailWithUndefinedSalesperson))

        const result = await getCustomerDetail('ALFKI', '2024-01-01', '2024-12-31')

        expect(result.salespersonBreakdown[0].salesPerson).toBeUndefined()
      })

      it('handles empty revenueByMonth array', async () => {
        const detailNoRevenue: CustomerDetail = { ...mockCustomerDetail, revenueByMonth: [] }
        vi.stubGlobal('fetch', mockFetchOk(detailNoRevenue))

        const result = await getCustomerDetail('ALFKI', '2024-01-01', '2024-12-31')

        expect(result.revenueByMonth).toHaveLength(0)
      })

      it('handles empty orders array', async () => {
        const detailNoOrders: CustomerDetail = { ...mockCustomerDetail, orders: [] }
        vi.stubGlobal('fetch', mockFetchOk(detailNoOrders))

        const result = await getCustomerDetail('ALFKI', '2024-01-01', '2024-12-31')

        expect(result.orders).toHaveLength(0)
      })

      it('interpolates dashes in customer id into the URL path', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockCustomerDetail))

        await getCustomerDetail('CUST-001', '2024-01-01', '2024-12-31')

        const url = calledUrl()
        expect(url.origin + url.pathname).toBe(`${API_BASE}/customers/CUST-001`)
      })
    })

    describe('error handling', () => {
      it('throws on a 404 response', async () => {
        vi.stubGlobal('fetch', mockFetchError(404, 'Not Found'))

        await expect(getCustomerDetail('GHOST', '2024-01-01', '2024-12-31')).rejects.toThrow(
          'fetch failed',
        )
      })

      it('throws on a 500 response', async () => {
        vi.stubGlobal('fetch', mockFetchError(500, 'Internal Server Error'))

        await expect(getCustomerDetail('ALFKI', '2024-01-01', '2024-12-31')).rejects.toThrow(
          'fetch failed',
        )
      })

      it('propagates a network-level rejection', async () => {
        vi.stubGlobal('fetch', mockFetchNetworkFailure('Network Error'))

        await expect(getCustomerDetail('ALFKI', '2024-01-01', '2024-12-31')).rejects.toThrow(
          'Network Error',
        )
      })
    })
  })
})