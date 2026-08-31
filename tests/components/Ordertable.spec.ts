import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import OrderTable from '@/components/OrderTable.vue'
import type { RecentOrder } from '@/types/dashboard'

// ---------------------------------------------------------------------------
// Router mock
// ---------------------------------------------------------------------------
const mockPush = vi.fn()

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
  }
})

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const makeOrder = (overrides: Partial<RecentOrder> = {}): RecentOrder => ({
  orderId: 1,
  customerName: 'Acme Corp',
  orderDate: '2024-03-15',
  orderTotal: 1500,
  status: 'Pending',
  ...overrides,
})

const ORDERS: RecentOrder[] = [
  makeOrder({ orderId: 1, customerName: 'Acme Corp', orderTotal: 1500, status: 'Pending' }),
  makeOrder({ orderId: 2, customerName: 'Beta LLC', orderTotal: 2750, status: 'Complete' }),
  makeOrder({ orderId: 3, customerName: 'Gamma Inc', orderTotal: 500, status: 'Pending' }),
  makeOrder({ orderId: 4, customerName: 'Delta Co', orderTotal: 9800, status: 'Complete' }),
  makeOrder({ orderId: 5, customerName: 'Epsilon Ltd', orderTotal: 300, status: 'Pending' }),
  makeOrder({ orderId: 6, customerName: 'Zeta GmbH', orderTotal: 4200, status: 'Complete' }),
]

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------
// useRouter is mocked via vi.mock, but vue-router's RouterLink/RouterView still
// need a router instance in the app — provide a minimal one.
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div/>' } }],
})

function mountTable(props: InstanceType<typeof OrderTable>['$props']) {
  return mount(OrderTable, {
    props,
    global: { plugins: [router] },
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('OrderTable.vue', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  describe('rendering', () => {
    it('renders the title prop', () => {
      const wrapper = mountTable({ title: 'Recent Orders', orders: [] })
      expect(wrapper.find('.cardTitle').text()).toBe('Recent Orders')
    })

    it('renders one row per order', () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS.slice(0, 3) })
      expect(wrapper.findAll('[data-testid="ordersTableXs"] tbody tr')).toHaveLength(3)
	  expect(wrapper.findAll('[data-testid="ordersTableSm"] tbody tr')).toHaveLength(3)
    })

    it('renders order ID with # prefix', () => {
      const wrapper = mountTable({ title: 'T', orders: [makeOrder({ orderId: 42 })] })
      expect(wrapper.find('tbody tr td').text()).toBe('#42')
    })

    it('renders customer name', () => {
      const wrapper = mountTable({
        title: 'T',
        orders: [makeOrder({ customerName: 'Test Customer' })],
      })
      expect(wrapper.find('tbody tr').text()).toContain('Test Customer')
    })

    it('renders formatted USD total (no cents)', () => {
      const wrapper = mountTable({ title: 'T', orders: [makeOrder({ orderTotal: 1234 })] })
      expect(wrapper.find('tbody tr').text()).toContain('$1,234')
    })

    it('renders formatted long date (formatDate)', () => {
      // 2024-03-15 → "Mar 15, 2024"
      const wrapper = mountTable({ title: 'T', orders: [makeOrder({ orderDate: '2024-03-15' })] })
      expect(wrapper.find('[data-testid="ordersTableXs"] tbody tr').text()).toContain('Mar 15, 2024')
    })

    it('renders formatted short date (formatDateShort)', () => {
      // 2024-03-15 → "3/15/2024"
      const wrapper = mountTable({ title: 'T', orders: [makeOrder({ orderDate: '2024-03-15' })] })
      expect(wrapper.find('tbody tr').text()).toContain('3/15/2024')
    })

    it('handles null orderDate gracefully (shows em dash)', () => {
      const wrapper = mountTable({ title: 'T', orders: [makeOrder({ orderDate: null })] })
      // Both date cells should show the fallback
      expect(wrapper.find('tbody tr').text()).toContain('—')
    })

    it('handles null customerName gracefully', () => {
      const wrapper = mountTable({ title: 'T', orders: [makeOrder({ customerName: null })] })
      // Should not throw; row still renders
      expect(wrapper.findAll('[data-testid="ordersTableXs"] tbody tr')).toHaveLength(1)
    })

    it('renders an empty table body when orders is empty', () => {
      const wrapper = mountTable({ title: 'T', orders: [] })
      expect(wrapper.findAll('tbody tr')).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------------
  // showStatus prop
  // -------------------------------------------------------------------------
  describe('showStatus prop', () => {
    it('hides the status column by default', () => {
      const wrapper = mountTable({ title: 'T', orders: [makeOrder()] })
      const statusCell = wrapper.find('[class*="rounded-full"]')
      expect(statusCell.exists()).toBe(false)
    })

    it('shows the status column when showStatus=true', () => {
      const wrapper = mountTable({ title: 'T', orders: [makeOrder()], showStatus: true })
      expect(wrapper.find('[class*="rounded-full"]').exists()).toBe(true)
    })

    it('applies amber styles for Pending status', () => {
      const wrapper = mountTable({
        title: 'T',
        orders: [makeOrder({ status: 'Pending' })],
        showStatus: true,
      })
      const badge = wrapper.find('[class*="rounded-full"]')
      expect(badge.classes()).toContain('bg-amber-50')
      expect(badge.classes()).toContain('text-amber-700')
    })

    it('applies teal styles for non-Pending status', () => {
      const wrapper = mountTable({
        title: 'T',
        orders: [makeOrder({ status: 'Complete' })],
        showStatus: true,
      })
      const badge = wrapper.find('[class*="rounded-full"]')
      expect(badge.classes()).toContain('bg-teal-50')
      expect(badge.classes()).toContain('text-teal-800')
    })

    it('renders the status text', () => {
      const wrapper = mountTable({
        title: 'T',
        orders: [makeOrder({ status: 'Pending' })],
        showStatus: true,
      })
      expect(wrapper.find('[class*="rounded-full"]').text()).toBe('Pending')
    })

    it('renders multiple status badges for multiple rows', () => {
      const orders = [
        makeOrder({ orderId: 1, status: 'Pending' }),
        makeOrder({ orderId: 2, status: 'Complete' }),
      ]
      const wrapper = mountTable({ title: 'T', orders, showStatus: true })
      expect(wrapper.findAll('[data-testid="ordersTableXs"]	[class*="rounded-full"]')).toHaveLength(2)
    })
  })

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  describe('row click navigation', () => {
    it('calls router.push with correct OrderDetail route on row click', async () => {
      const wrapper = mountTable({ title: 'T', orders: [makeOrder({ orderId: 7 })] })
      await wrapper.find('tbody tr').trigger('click')
      expect(mockPush).toHaveBeenCalledOnce()
      expect(mockPush).toHaveBeenCalledWith({ name: 'OrderDetail', params: { id: 7 } })
    })

    it('navigates to the correct order when multiple rows exist', async () => {
      const orders = [
        makeOrder({ orderId: 10 }),
        makeOrder({ orderId: 20 }),
        makeOrder({ orderId: 30 }),
      ]
      const wrapper = mountTable({ title: 'T', orders })
      const rows = wrapper.findAll('tbody tr')
      await rows[1].trigger('click')
      expect(mockPush).toHaveBeenCalledWith({ name: 'OrderDetail', params: { id: 20 } })
    })
  })

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------
  describe('pagination', () => {
    it('does not render pagination when pageSize is not set', () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS })
      expect(wrapper.find('.pagination').exists()).toBe(false)
    })

    it('does not render pagination when all orders fit on one page', () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS.slice(0, 3), pageSize: 5 })
      expect(wrapper.find('.pagination').exists()).toBe(false)
    })

    it('renders pagination when orders exceed pageSize', () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS, pageSize: 3 })
      expect(wrapper.find('.pagination').exists()).toBe(true)
    })

    it('shows only the first page of rows on mount', () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS, pageSize: 2 })
      const rows = wrapper.findAll('[data-testid="ordersTableXs"] tbody tr')
      expect(rows).toHaveLength(2)
      expect(rows[0]!.text()).toContain('Acme Corp')
      expect(rows[1]!.text()).toContain('Beta LLC')
    })

    it('advances to the next page when › is clicked', async () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS, pageSize: 2 })
      const nextBtn = wrapper.findAll('.pageBtn').find((b) => b.text() === '›')!
      await nextBtn.trigger('click')
      const rows = wrapper.findAll('tbody tr')
      expect(rows[0].text()).toContain('Gamma Inc')
      expect(rows[1].text()).toContain('Delta Co')
    })

    it('goes back to the previous page when ‹ is clicked', async () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS, pageSize: 2 })
      // Go to page 2 first
      const nextBtn = wrapper.findAll('.pageBtn').find((b) => b.text() === '›')!
      await nextBtn.trigger('click')
      // Then go back
      const prevBtn = wrapper.findAll('.pageBtn').find((b) => b.text() === '‹')!
      await prevBtn.trigger('click')
      expect(wrapper.find('tbody tr').text()).toContain('Acme Corp')
    })

    it('jumps to first page when « is clicked', async () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS, pageSize: 2 })
      // Navigate to page 3
      const pageBtns = wrapper.findAll('.pageBtn')
      const nextBtn = pageBtns.find((b) => b.text() === '›')!
      await nextBtn.trigger('click')
      await nextBtn.trigger('click')
      // Click «
      const firstBtn = wrapper.findAll('.pageBtn').find((b) => b.text() === '«')!
      await firstBtn.trigger('click')
      expect(wrapper.find('tbody tr').text()).toContain('Acme Corp')
    })

    it('jumps to last page when » is clicked', async () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS, pageSize: 2 })
      const lastBtn = wrapper.findAll('.pageBtn').find((b) => b.text() === '»')!
      await lastBtn.trigger('click')
      // Last page of 6 orders / pageSize 2 = page 3 → Epsilon Ltd, Zeta GmbH
      const rows = wrapper.findAll('tbody tr')
      expect(rows[0].text()).toContain('Epsilon Ltd')
      expect(rows[1].text()).toContain('Zeta GmbH')
    })

    it('disables ‹ and « on the first page', () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS, pageSize: 2 })
      const pageBtns = wrapper.findAll('.pageBtn')
      const prevBtn = pageBtns.find((b) => b.text() === '‹')!
      const firstBtn = pageBtns.find((b) => b.text() === '«')!
      expect(prevBtn.attributes('disabled')).toBeDefined()
      expect(firstBtn.attributes('disabled')).toBeDefined()
    })

    it('disables › and » on the last page', async () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS, pageSize: 2 })
      const lastBtn = wrapper.findAll('.pageBtn').find((b) => b.text() === '»')!
      await lastBtn.trigger('click')
      const pageBtns = wrapper.findAll('.pageBtn')
      const nextBtn = pageBtns.find((b) => b.text() === '›')!
      const lastBtnAfter = pageBtns.find((b) => b.text() === '»')!
      expect(nextBtn.attributes('disabled')).toBeDefined()
      expect(lastBtnAfter.attributes('disabled')).toBeDefined()
    })

    it('marks the active page button with pageBtnActive class', async () => {
      const wrapper = mountTable({ title: 'T', orders: ORDERS, pageSize: 2 })
      const nextBtn = wrapper.findAll('.pageBtn').find((b) => b.text() === '›')!
      await nextBtn.trigger('click') // go to page 2

      const activeBtn = wrapper
        .findAll('.pageBtn')
        .find((b) => b.classes().includes('pageBtnActive'))
      expect(activeBtn?.text()).toBe('2')
    })

    it('renders all page numbers inline when total pages ≤ 7', () => {
      // 6 orders / pageSize 2 = 3 pages — no ellipsis expected
      const wrapper = mountTable({ title: 'T', orders: ORDERS, pageSize: 2 })
      const pageNumberBtns = wrapper.findAll('.pageBtn').filter((b) => /^\d+$/.test(b.text()))
      expect(pageNumberBtns).toHaveLength(3)
      expect(wrapper.findAll('.pageEllipsis')).toHaveLength(0)
    })

    it('renders ellipsis when total pages > 7 and current page is near middle', async () => {
      // 20 orders / pageSize 2 = 10 pages; navigate to page 5
      const manyOrders = Array.from({ length: 20 }, (_, i) =>
        makeOrder({ orderId: i + 1, customerName: `Customer ${i + 1}` }),
      )
      const wrapper = mountTable({ title: 'T', orders: manyOrders, pageSize: 2 })
      // Navigate to page 5 by clicking › four times
      for (let i = 0; i < 4; i++) {
        const nextBtn = wrapper.findAll('.pageBtn').find((b) => b.text() === '›')!
        await nextBtn.trigger('click')
      }
      expect(wrapper.findAll('.pageEllipsis').length).toBeGreaterThan(0)
    })
  })

  // -------------------------------------------------------------------------
  // ISO datetime strings (T-separated)
  // -------------------------------------------------------------------------
  describe('ISO datetime string handling', () => {
    it('strips the time component from ISO datetime strings', () => {
      // Should parse date portion only → "Mar 15, 2024"
      const wrapper = mountTable({
        title: 'T',
        orders: [makeOrder({ orderDate: '2024-03-15T14:30:00' })],
      })
      expect(wrapper.find('[data-testid="ordersTableXs"] tbody tr').text()).toContain('Mar 15, 2024')
    })
  })
})
