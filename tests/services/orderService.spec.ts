import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getOrders,
  getOrderById,
  getCustomerLookups,
  getSalespersonLookups,
  getCountryLookups,
  getOrderDetail,
} from '@/services/orderService'
import type {
  Order,
  PagedResult,
  OrderCustomerLookup,
  OrderSalespersonLookup,
  OrderCountryLookup,
  OrderDetail,
} from '@/types/order'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockOrder: Order = {
  orderId: 10248,
  orderDate: '1996-07-04T00:00:00',
  shippedDate: '1996-07-16T00:00:00',
  freight: 32.38,
  shipCountry: 'France',
  customerId: 'VINET',
  customerName: 'Vins et alcools Chevalier',
  employeeId: 5,
  salesPerson: 'Steven Buchanan',
  orderTotal: 0,
}

const mockPagedResult: PagedResult<Order> = {
  data: [mockOrder],
  totalCount: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
}

const mockCustomerLookups: OrderCustomerLookup[] = [
  { customerId: 'VINET', customerName: 'Vins et alcools Chevalier' },
  { customerId: 'ALFKI', customerName: 'Alfreds Futterkiste' },
]

const mockSalespersonLookups: OrderSalespersonLookup[] = [
  { employeeId: 5, fullName: 'Steven Buchanan' },
  { employeeId: 3, fullName: 'Janet Leverling' },
]

const mockCountryLookups: OrderCountryLookup[] = [
  { country: 'France' },
  { country: 'Germany' },
]

const mockOrderDetail: OrderDetail = {
  orderId: 10248,
  orderDate: '1996-07-04T00:00:00',
  shippedDate: '1996-07-16T00:00:00',
  status: 'Shipped',
  customer: {
    customerId: 'VINET',
    customerName: 'Vins et alcools Chevalier',
    city: 'Reims',
    country: 'France',
  },
  salesperson: {
    employeeId: 5,
    salesPerson: 'Steven Buchanan',
  },
  summary: {
    subtotal: 440.0,
    totalDiscount: 0.0,
    orderTotal: 440.0,
    itemCount: 3,
  },
  lineItems: [
    {
      productId: 11,
      productName: 'Queso Cabrales',
      unitPrice: 14.0,
      quantity: 12,
      discount: 0,
      lineTotal: 168.0,
    },
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockFetchOk(payload: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: vi.fn().mockResolvedValue(payload),
  })
}

function mockFetchError(status: number, statusText: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
    json: vi.fn().mockResolvedValue({}),
  })
}

function mockFetchNetworkFailure(message = 'Network Error') {
  return vi.fn().mockRejectedValue(new TypeError(message))
}

function calledUrl(): URL {
  return new URL((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

// VITE_API_BASE must be set in vitest.config.ts → test.env
// e.g.  env: { VITE_API_BASE: 'http://localhost:5000/api' }
const API_BASE = 'http://localhost:5000/api'

describe('orderService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── getOrders ───────────────────────────────────────────────────────────────

  describe('getOrders', () => {
    describe('happy path', () => {
      it('calls the correct base URL with page and pageSize', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getOrders(1, 10)

        const url = calledUrl()
        expect(url.origin + url.pathname).toBe(`${API_BASE}/orders`)
        expect(url.searchParams.get('page')).toBe('1')
        expect(url.searchParams.get('pageSize')).toBe('10')
      })

      it('returns the parsed paged result', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        const result = await getOrders(1, 10)

        expect(result).toEqual(mockPagedResult)
      })

      it('uses an empty filters object by default', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getOrders(1, 10)

        const params = calledUrl().searchParams
        expect(params.has('search')).toBe(false)
        expect(params.has('sortBy')).toBe(false)
        expect(params.has('customerId')).toBe(false)
        expect(params.has('employeeId')).toBe(false)
        expect(params.has('shipCountry')).toBe(false)
      })

      it('appends all provided string filters', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getOrders(1, 10, {
          search: 'Vinet',
          sortBy: 'orderDate',
          sortDir: 'desc',
          customerId: 'VINET',
          shipCountry: 'France',
        })

        const params = calledUrl().searchParams
        expect(params.get('search')).toBe('Vinet')
        expect(params.get('sortBy')).toBe('orderDate')
        expect(params.get('sortDir')).toBe('desc')
        expect(params.get('customerId')).toBe('VINET')
        expect(params.get('shipCountry')).toBe('France')
      })

      it('converts employeeId number to a string param', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getOrders(1, 10, { employeeId: 5 })

        expect(calledUrl().searchParams.get('employeeId')).toBe('5')
      })

      it('appends date range filters', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getOrders(1, 10, {
          orderDateStart: '2024-01-01',
          orderDateEnd: '2024-12-31',
          shippedDateStart: '2024-01-15',
          shippedDateEnd: '2024-12-15',
        })

        const params = calledUrl().searchParams
        expect(params.get('orderDateStart')).toBe('2024-01-01')
        expect(params.get('orderDateEnd')).toBe('2024-12-31')
        expect(params.get('shippedDateStart')).toBe('2024-01-15')
        expect(params.get('shippedDateEnd')).toBe('2024-12-15')
      })

      it('omits falsy filter keys (undefined)', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockPagedResult))

        await getOrders(1, 10, { search: undefined, employeeId: undefined })

        const params = calledUrl().searchParams
        expect(params.has('search')).toBe(false)
        expect(params.has('employeeId')).toBe(false)
      })

      it('handles an empty data array', async () => {
        const empty: PagedResult<Order> = {
          data: [],
          totalCount: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        }
        vi.stubGlobal('fetch', mockFetchOk(empty))

        const result = await getOrders(1, 10)

        expect(result.data).toHaveLength(0)
        expect(result.totalCount).toBe(0)
      })

      it('handles orders where shippedDate is null', async () => {
        const unshipped: Order = { ...mockOrder, shippedDate: null }
        vi.stubGlobal('fetch', mockFetchOk({ ...mockPagedResult, data: [unshipped] }))

        const result = await getOrders(1, 10)

        expect(result.data[0].shippedDate).toBeNull()
      })

      it('handles orderDate being null', async () => {
        const noDate: Order = { ...mockOrder, orderDate: null }
        vi.stubGlobal('fetch', mockFetchOk({ ...mockPagedResult, data: [noDate] }))

        const result = await getOrders(1, 10)

        expect(result.data[0].orderDate).toBeNull()
      })
    })

    describe('error handling', () => {
      it.each([
        [400, 'Bad Request'],
        [404, 'Not Found'],
        [500, 'Internal Server Error'],
      ])('throws on %i %s', async (status, statusText) => {
        vi.stubGlobal('fetch', mockFetchError(status, statusText))

        await expect(getOrders(1, 10)).rejects.toThrow(`Failed to fetch orders: ${statusText}`)
      })

      it('propagates a network-level rejection', async () => {
        vi.stubGlobal('fetch', mockFetchNetworkFailure('Failed to fetch'))

        await expect(getOrders(1, 10)).rejects.toThrow('Failed to fetch')
      })
    })
  })

  // ── getOrderById ────────────────────────────────────────────────────────────

  describe('getOrderById', () => {
    describe('happy path', () => {
      it('calls the correct URL with the order id', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockOrder))

        await getOrderById(10248)

        const url = calledUrl()
        expect(url.origin + url.pathname).toBe(`${API_BASE}/orders/10248`)
      })

      it('returns the parsed order', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockOrder))

        const result = await getOrderById(10248)

        expect(result).toEqual(mockOrder)
      })

      it('handles an order with null shippedDate', async () => {
        const pending = { ...mockOrder, shippedDate: null }
        vi.stubGlobal('fetch', mockFetchOk(pending))

        const result = await getOrderById(10248)

        expect(result.shippedDate).toBeNull()
      })
    })

    describe('error handling', () => {
      it.each([
        [404, 'Not Found'],
        [500, 'Internal Server Error'],
      ])('throws on %i %s', async (status, statusText) => {
        vi.stubGlobal('fetch', mockFetchError(status, statusText))

        await expect(getOrderById(99999)).rejects.toThrow(`Failed to fetch order: ${statusText}`)
      })

      it('propagates a network-level rejection', async () => {
        vi.stubGlobal('fetch', mockFetchNetworkFailure())

        await expect(getOrderById(10248)).rejects.toThrow('Network Error')
      })
    })
  })

  // ── getCustomerLookups ──────────────────────────────────────────────────────

  describe('getCustomerLookups', () => {
    describe('happy path', () => {
      it('calls the correct URL', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockCustomerLookups))

        await getCustomerLookups()

        const url = calledUrl()
        expect(url.origin + url.pathname).toBe(`${API_BASE}/orders/lookups/customers`)
      })

      it('returns the parsed lookup array', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockCustomerLookups))

        const result = await getCustomerLookups()

        expect(result).toEqual(mockCustomerLookups)
        expect(result).toHaveLength(2)
      })

      it('handles an empty lookup array', async () => {
        vi.stubGlobal('fetch', mockFetchOk([]))

        const result = await getCustomerLookups()

        expect(result).toHaveLength(0)
      })
    })

    describe('error handling', () => {
      it.each([
        [404, 'Not Found'],
        [500, 'Internal Server Error'],
      ])('throws on %i %s', async (status, statusText) => {
        vi.stubGlobal('fetch', mockFetchError(status, statusText))

        await expect(getCustomerLookups()).rejects.toThrow('Failed to fetch customer lookups')
      })

      it('propagates a network-level rejection', async () => {
        vi.stubGlobal('fetch', mockFetchNetworkFailure())

        await expect(getCustomerLookups()).rejects.toThrow('Network Error')
      })
    })
  })

  // ── getSalespersonLookups ───────────────────────────────────────────────────

  describe('getSalespersonLookups', () => {
    describe('happy path', () => {
      it('calls the correct URL', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockSalespersonLookups))

        await getSalespersonLookups()

        const url = calledUrl()
        expect(url.origin + url.pathname).toBe(`${API_BASE}/orders/lookups/salespersons`)
      })

      it('returns the parsed lookup array', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockSalespersonLookups))

        const result = await getSalespersonLookups()

        expect(result).toEqual(mockSalespersonLookups)
      })

      it('handles an empty lookup array', async () => {
        vi.stubGlobal('fetch', mockFetchOk([]))

        const result = await getSalespersonLookups()

        expect(result).toHaveLength(0)
      })
    })

    describe('error handling', () => {
      it.each([
        [404, 'Not Found'],
        [500, 'Internal Server Error'],
      ])('throws on %i %s', async (status, statusText) => {
        vi.stubGlobal('fetch', mockFetchError(status, statusText))

        await expect(getSalespersonLookups()).rejects.toThrow('Failed to fetch salesperson lookups')
      })

      it('propagates a network-level rejection', async () => {
        vi.stubGlobal('fetch', mockFetchNetworkFailure())

        await expect(getSalespersonLookups()).rejects.toThrow('Network Error')
      })
    })
  })

  // ── getCountryLookups ───────────────────────────────────────────────────────

  describe('getCountryLookups', () => {
    describe('happy path', () => {
      it('calls the correct URL', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockCountryLookups))

        await getCountryLookups()

        const url = calledUrl()
        expect(url.origin + url.pathname).toBe(`${API_BASE}/orders/lookups/countries`)
      })

      it('returns the parsed lookup array', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockCountryLookups))

        const result = await getCountryLookups()

        expect(result).toEqual(mockCountryLookups)
      })

      it('handles an empty lookup array', async () => {
        vi.stubGlobal('fetch', mockFetchOk([]))

        const result = await getCountryLookups()

        expect(result).toHaveLength(0)
      })
    })

    describe('error handling', () => {
      it.each([
        [404, 'Not Found'],
        [500, 'Internal Server Error'],
      ])('throws on %i %s', async (status, statusText) => {
        vi.stubGlobal('fetch', mockFetchError(status, statusText))

        await expect(getCountryLookups()).rejects.toThrow('Failed to fetch country lookups')
      })

      it('propagates a network-level rejection', async () => {
        vi.stubGlobal('fetch', mockFetchNetworkFailure())

        await expect(getCountryLookups()).rejects.toThrow('Network Error')
      })
    })
  })

  // ── getOrderDetail ──────────────────────────────────────────────────────────

  describe('getOrderDetail', () => {
    describe('happy path', () => {
      it('calls the correct URL with the order id', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockOrderDetail))

        await getOrderDetail(10248)

        const url = calledUrl()
        expect(url.origin + url.pathname).toBe(`${API_BASE}/orders/detail/10248`)
      })

      it('returns the full parsed order detail', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockOrderDetail))

        const result = await getOrderDetail(10248)

        expect(result).toEqual(mockOrderDetail)
      })

      it('returns nested customer fields correctly', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockOrderDetail))

        const result = await getOrderDetail(10248)

        expect(result.customer.customerId).toBe('VINET')
        expect(result.customer.city).toBe('Reims')
        expect(result.customer.country).toBe('France')
      })

      it('returns nested summary fields correctly', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockOrderDetail))

        const result = await getOrderDetail(10248)

        expect(result.summary.orderTotal).toBe(440.0)
        expect(result.summary.itemCount).toBe(3)
        expect(result.summary.totalDiscount).toBe(0.0)
      })

      it('returns line items array correctly', async () => {
        vi.stubGlobal('fetch', mockFetchOk(mockOrderDetail))

        const result = await getOrderDetail(10248)

        expect(result.lineItems).toHaveLength(1)
        expect(result.lineItems[0].productName).toBe('Queso Cabrales')
        expect(result.lineItems[0].lineTotal).toBe(168.0)
      })

      it('handles an order detail with null shippedDate', async () => {
        const unshipped: OrderDetail = { ...mockOrderDetail, shippedDate: null }
        vi.stubGlobal('fetch', mockFetchOk(unshipped))

        const result = await getOrderDetail(10248)

        expect(result.shippedDate).toBeNull()
      })

      it('handles an order detail with empty line items', async () => {
        const noLines: OrderDetail = { ...mockOrderDetail, lineItems: [] }
        vi.stubGlobal('fetch', mockFetchOk(noLines))

        const result = await getOrderDetail(10248)

        expect(result.lineItems).toHaveLength(0)
      })

      it('handles a line item with a non-zero discount', async () => {
        const discounted: OrderDetail = {
          ...mockOrderDetail,
          lineItems: [{ ...mockOrderDetail.lineItems[0], discount: 0.1, lineTotal: 151.2 }],
        }
        vi.stubGlobal('fetch', mockFetchOk(discounted))

        const result = await getOrderDetail(10248)

        expect(result.lineItems[0].discount).toBe(0.1)
        expect(result.lineItems[0].lineTotal).toBe(151.2)
      })
    })

    describe('error handling', () => {
      it.each([
        [404, 'Not Found'],
        [500, 'Internal Server Error'],
      ])('throws on %i %s', async (status, statusText) => {
        vi.stubGlobal('fetch', mockFetchError(status, statusText))

        await expect(getOrderDetail(99999)).rejects.toThrow('Failed to fetch order detail')
      })

      it('propagates a network-level rejection', async () => {
        vi.stubGlobal('fetch', mockFetchNetworkFailure())

        await expect(getOrderDetail(10248)).rejects.toThrow('Network Error')
      })
    })
  })
})