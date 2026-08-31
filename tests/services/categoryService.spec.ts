import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCategorySales } from '@/services/categoryService'
import type { CategorySales } from '@/types/category'

const mockCategorySales: CategorySales[] = [
  { categoryName: 'Electronics', revenue: 5000 },
  { categoryName: 'Clothing', revenue: 3200 },
]

function mockFetch(ok: boolean, body: unknown, statusText = 'Internal Server Error') {
  return vi.fn().mockResolvedValue({
    ok,
    statusText,
    json: vi.fn().mockResolvedValue(body),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getCategorySales', () => {
  it('calls the correct URL with given date range', async () => {
    global.fetch = mockFetch(true, mockCategorySales)

    await getCategorySales('2024-01-01', '2024-01-31')

    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_BASE}/category?startDate=2024-01-01&endDate=2024-01-31`
    )
  })

  it('returns parsed JSON on a successful response', async () => {
    global.fetch = mockFetch(true, mockCategorySales)

    const result = await getCategorySales('2024-01-01', '2024-01-31')

    expect(result).toEqual(mockCategorySales)
  })

  it('throws an error when the response is not ok', async () => {
    global.fetch = mockFetch(false, null, 'Bad Request')

    await expect(getCategorySales('2024-01-01', '2024-01-31'))
      .rejects
      .toThrow('Failed to fetch category sales: Bad Request')
  })

  it('throws when fetch itself rejects (e.g. network failure)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await expect(getCategorySales('2024-01-01', '2024-01-31'))
      .rejects
      .toThrow('Network error')
  })

  it('returns an empty array when the API responds with one', async () => {
    global.fetch = mockFetch(true, [])

    const result = await getCategorySales('2024-01-01', '2024-01-31')

    expect(result).toEqual([])
  })
})