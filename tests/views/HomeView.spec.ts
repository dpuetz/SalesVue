import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { getDashboardData } from '@/services/dashboardService'
import type { DashboardData } from '@/types/dashboard'
import { createPinia } from 'pinia'

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Stub VChart globally — jsdom has no canvas context
vi.mock('vue-echarts', () => ({
  default: { name: 'VChart', template: '<div class="vchart-stub" />' },
}))

// Stub the dashboard service
vi.mock('@/services/dashboardService')

// Stub vue-router's useRouter so we can spy on push
const mockPush = vi.fn()
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return { ...actual, useRouter: () => ({ push: mockPush }) }
})

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockDashboard: DashboardData = {
  summary: {
    totalRevenue: 1250000,
    totalOrders: 830,
    avgOrderValue: 1506,
    shippedOrders: 790,
    pendingOrders: 40,
  },
  revenueByEmployee: [
    { salesPerson: 'Janet Leverling', revenue: 420000, employeeId: 3 },
    { salesPerson: 'Steven Buchanan', revenue: 380000, employeeId: 5 },
  ],
  ordersByMonth: [
    { year: 2025, month: 1, orderCount: 70 },
    { year: 2025, month: 2, orderCount: 65 },
  ],
  topCustomers: [
    { customerId: 'VINET', customerName: 'Vins et alcools Chevalier', country: 'France', revenue: 95000 },
    { customerId: 'ALFKI', customerName: 'Alfreds Futterkiste', country: 'Germany', revenue: 78000 },
  ],
  recentOrders: [
    { orderId: 10248, customerName: 'Vins et alcools Chevalier', orderDate: '2025-01-04T00:00:00', orderTotal: 440, status: 'Shipped' },
    { orderId: 10249, customerName: null, orderDate: null, orderTotal: 200, status: 'Pending' },
  ],
  recentAccounts: [
    { customerId: 'NEWCO', companyName: 'New Company Ltd', contactName: 'Bob Smith', city: 'London', country: 'UK', createdDate: '2025-03-01T00:00:00' },
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Mounts HomeView with a minimal router and flushes the onMounted fetch.
 * Pass `resolveWith` to simulate a successful load, or `rejectWith` to simulate failure.
 */
async function mountView(options: {
  resolveWith?: DashboardData
  rejectWith?: Error
} = { resolveWith: mockDashboard }) {
  const { resolveWith, rejectWith } = options

  if (rejectWith) {
    vi.mocked(getDashboardData).mockRejectedValue(rejectWith)
  } else {
    vi.mocked(getDashboardData).mockResolvedValue(resolveWith ?? mockDashboard)
  }

 const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/salesperson/:id', name: 'SalespersonDetail', component: { template: '<div/>' } },
      { path: '/customer/:id', name: 'CustomerDetail', component: { template: '<div/>' } },
    ],
  })

  const wrapper = mount(HomeView, {
    global: { plugins: [router, createPinia()] }, 
  })

  await flushPromises()
  return wrapper
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('HomeView', () => {
  beforeEach(() => {
    mockPush.mockClear()
    // jsdom has no matchMedia; provide a minimal stub
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Initial load ────────────────────────────────────────────────────────────

  describe('initial load', () => {
    it('calls getDashboardData with the default date range on mount', async () => {
      await mountView()

      expect(getDashboardData).toHaveBeenCalledOnce()
      expect(getDashboardData).toHaveBeenCalledWith('2025-01-01', '2025-12-31')
    })

    it('renders the page heading', async () => {
      const wrapper = await mountView()

      expect(wrapper.find('h1').text()).toBe('Sales Dashboard')
    })

    it('renders four KPI cards', async () => {
      const wrapper = await mountView()

      const cards = wrapper.findAll('.card')
      // at minimum the 4 KPI cards are present
      expect(cards.length).toBeGreaterThanOrEqual(4)
    })

    it('displays formatted total revenue in the first KPI card', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).toContain('$1,250,000')
    })

    it('displays total orders', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).toContain('830')
    })

    it('displays shipped orders count', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).toContain('790')
    })

    it('displays pending orders count', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).toContain('40 pending')
    })
  })

  // ── Error state ─────────────────────────────────────────────────────────────

  describe('error state', () => {
    it('shows the error message when the fetch rejects', async () => {
      const wrapper = await mountView({ rejectWith: new Error('500') })

      expect(wrapper.text()).toContain('Sorry, an error has occurred.')
    })

    it('does not render KPI cards when the fetch rejects', async () => {
      const wrapper = await mountView({ rejectWith: new Error('500') })

      expect(wrapper.find('.kpiGrid').exists()).toBe(false)
    })

    it('clears the error on a successful subsequent load', async () => {
      vi.mocked(getDashboardData)
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(mockDashboard)

      const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/', component: HomeView }],
      })
      const wrapper = mount(HomeView, { global: { plugins: [router, createPinia()] } })
      await flushPromises()

      expect(wrapper.text()).toContain('Sorry, an error has occurred.')

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(wrapper.text()).not.toContain('Sorry, an error has occurred.')
      expect(wrapper.text()).toContain('$1,250,000')
    })
  })

  // ── Date validation ─────────────────────────────────────────────────────────

  describe('date validation', () => {
    it('shows a warning when start date is after end date', async () => {
      const wrapper = await mountView()

      const [startInput, endInput] = wrapper.findAll('input[type="date"]')
      await startInput.setValue('2025-12-31')
      await endInput.setValue('2025-01-01')

      expect(wrapper.text()).toContain('End date must be after start date.')
    })

    it('does not show a warning when dates are valid', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).not.toContain('End date must be after start date.')
    })

    it('does not call getDashboardData when Apply is clicked with an invalid date range', async () => {
      const wrapper = await mountView()
      vi.mocked(getDashboardData).mockClear()

      const [startInput, endInput] = wrapper.findAll('input[type="date"]')
      await startInput.setValue('2025-12-31')
      await endInput.setValue('2025-01-01')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(getDashboardData).not.toHaveBeenCalled()
    })
  })

  // ── Apply button ────────────────────────────────────────────────────────────

  describe('Apply button', () => {
    it('calls getDashboardData with the updated date range when Apply is clicked', async () => {
      const wrapper = await mountView()
      vi.mocked(getDashboardData).mockClear()
      vi.mocked(getDashboardData).mockResolvedValue(mockDashboard)

      const [startInput, endInput] = wrapper.findAll('input[type="date"]')
      await startInput.setValue('2024-01-01')
      await endInput.setValue('2024-12-31')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(getDashboardData).toHaveBeenCalledWith('2024-01-01', '2024-12-31')
    })

    it('shows "Loading..." on the button while fetching', async () => {
      let resolve!: (v: DashboardData) => void
      vi.mocked(getDashboardData).mockReturnValue(new Promise(r => { resolve = r }))

      const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/', component: HomeView }],
      })
      const wrapper = mount(HomeView, { global: { plugins: [router, createPinia()] } })

      // button shows Loading... while the initial promise is pending
      await vi.waitFor(() => expect(wrapper.find('button').text()).toBe('Loading...'))

      resolve(mockDashboard)
      await flushPromises()

      expect(wrapper.find('button').text()).toBe('Apply')
    })

    it('disables the Apply button while loading', async () => {
      let resolve!: (v: DashboardData) => void
      vi.mocked(getDashboardData).mockReturnValue(new Promise(r => { resolve = r }))

      const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/', component: HomeView }],
      })
      const wrapper = mount(HomeView, { global: { plugins: [router, createPinia()] } })

      await vi.waitFor(() => expect(wrapper.find('button').attributes('disabled')).toBeDefined())

      resolve(mockDashboard)
      await flushPromises()
    })
  })

  // ── Top customers list ──────────────────────────────────────────────────────

  describe('top customers list', () => {
    it('renders a row for each top customer', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).toContain('Vins et alcools Chevalier')
      expect(wrapper.text()).toContain('Alfreds Futterkiste')
    })

    it('displays the country badge for each customer', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).toContain('France')
      expect(wrapper.text()).toContain('Germany')
    })

    it('displays formatted revenue for each customer', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).toContain('$95,000')
      expect(wrapper.text()).toContain('$78,000')
    })

    it('navigates to CustomerDetail with the date range when a customer row is clicked', async () => {
      const wrapper = await mountView()

      // find the top customers card — it follows the "Top customers" heading
      const allTableRows = wrapper.findAll('.tableRow')
      const customerRow = allTableRows.find(r => r.text().includes('Vins et alcools Chevalier'))
      await customerRow!.trigger('click')

      expect(mockPush).toHaveBeenCalledWith({
        name: 'CustomerDetail',
        params: { id: 'VINET' },
        query: { from: '2025-01-01', to: '2025-12-31' },
      })
    })
  })

  // ── Recently acquired accounts ──────────────────────────────────────────────

  describe('recently acquired accounts', () => {
    it('renders a row for each recent account', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).toContain('New Company Ltd')
    })

    it('displays the city and country', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).toContain('London, UK')
    })

    it('displays a formatted created date', async () => {
      const wrapper = await mountView()

      expect(wrapper.text()).toContain('Mar 1, 2025')
    })

    it('displays initials avatar derived from company name', async () => {
      const wrapper = await mountView()

      // "New Company Ltd" → "NC"
      expect(wrapper.text()).toContain('NC')
    })

    it('shows a "New" badge on each account', async () => {
      const wrapper = await mountView()

      const badges = wrapper.findAll('span').filter(s => s.text() === 'New')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Charts (stubbed) ────────────────────────────────────────────────────────

  describe('chart stubs', () => {
    it('renders the expected number of VChart stubs', async () => {
      const wrapper = await mountView()

      // bar (employee) + bar (monthly) + donut = 3 charts
      expect(wrapper.findAll('.vchart-stub')).toHaveLength(3)
    })
  })

  // ── Navigation helpers ──────────────────────────────────────────────────────

  describe('navigation', () => {
    it('preserves the applied date range in the salesperson query when navigating', async () => {
      // Change the date range, apply it, then click would be on VChart (stubbed),
      // so we test goToSalesperson indirectly via the exposed instance
      const wrapper = await mountView()

      // Trigger a date change and reload so appliedStartDate updates
      vi.mocked(getDashboardData).mockResolvedValue(mockDashboard)
      const [startInput, endInput] = wrapper.findAll('input[type="date"]')
      await startInput.setValue('2024-06-01')
      await endInput.setValue('2024-06-30')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      // goToCustomer uses the applied range — click a customer row
      const allTableRows = wrapper.findAll('.tableRow')
      const customerRow = allTableRows.find(r => r.text().includes('Vins et alcools Chevalier'))
      await customerRow!.trigger('click')

      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { from: '2024-06-01', to: '2024-06-30' },
        }),
      )
    })
  })
})