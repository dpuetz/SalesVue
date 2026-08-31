<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
//datepicker
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
//services
import { getOrders, getCustomerLookups, getSalespersonLookups, getCountryLookups } from '@/services/orderService';
//types
import type { OrderFilters } from '@/types/order';
import type { Order, PagedResult, OrderCustomerLookup, OrderSalespersonLookup, OrderCountryLookup } from '@/types/order';
//icons
import { ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon, ChevronDownIcon as ChevronDown } from '@heroicons/vue/24/outline';
//composables
import { useDate } from '@/composables/useDate';
import { useCurrency } from '@/composables/useCurrency';
//stores
import { useOrderFiltersStore } from '@/stores/orderFilters';

// Data
const result = ref<PagedResult<Order> | null>(null);
const page = ref(1);
const pageSize = ref(25);
const loading = ref(false);
const error = ref<string | null>(null);
const customerOpen = ref(false);
const salespersonOpen = ref(false);
const countryOpen = ref(false);
const { formatUSD } = useCurrency();
const filterStore = useOrderFiltersStore();

const showPagination = computed(() => {
  return result.value ? result.value.totalPages > 1 : false;
});
const pageNumbers = computed(() => {
  const total = result.value?.totalPages ?? 0;
  const current = page.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++)
    pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});

// Lookups
const customerLookups = ref<OrderCustomerLookup[]>([]);
const salespersonLookups = ref<OrderSalespersonLookup[]>([]);
const countryLookups = ref<OrderCountryLookup[]>([]);

// Search inputs for combobox filtering
const customerSearch = ref('');
const salespersonSearch = ref('');
const countrySearch = ref('');

// Filters
const search = ref('');
const sortBy = ref('orderId');
const sortDir = ref<'asc' | 'desc'>('asc');
const customerId = ref(filterStore.customerId);
const employeeId = ref<number | null>(filterStore.employeeId);
const orderDateRange = ref<string[] | null>(filterStore.orderDateRange);
const shippedDateRange = ref<string[] | null>(filterStore.shippedDateRange);
const shipCountry = ref(filterStore.shipCountry);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Filtered lookup lists
const filteredCustomers = computed(() =>
  customerLookups.value.filter(c =>
    c.customerName.toLowerCase().includes(customerSearch.value.toLowerCase())
  )
);
const filteredSalespersons = computed(() =>
  salespersonLookups.value.filter(s =>
    s.fullName.toLowerCase().includes(salespersonSearch.value.toLowerCase())
  )
);
const filteredCountries = computed(() =>
  countryLookups.value.filter(c =>
    c.country.toLowerCase().includes(countrySearch.value.toLowerCase())
  )
);

// Active filter count for badge
const activeFilterCount = computed(() => {
  let count = 0;
  if (customerId.value) count++;
  if (employeeId.value) count++;
  if (orderDateRange.value) count++;
  if (shippedDateRange.value) count++;
  if (shipCountry.value) count++;
  return count;
});

// Selected label helpers for badges
const selectedCustomerLabel = computed(() => {
  if (!customerId.value) return null;
  return customerLookups.value.find(c => c.customerId === customerId.value)?.customerName ?? null;
});
const selectedSalespersonLabel = computed(() => {
  if (!employeeId.value) return null;
  return salespersonLookups.value.find(s => s.employeeId === employeeId.value)?.fullName ?? null;
});
const selectedCountryLabel = computed(() => shipCountry.value || null);

const selectCustomer = (id: string) => {
  customerId.value = id;
  customerOpen.value = false;
  customerSearch.value = '';
  onFilterChange();
};
const clearCustomer = () => {
  customerId.value = '';
  customerSearch.value = '';
  onFilterChange();
};
const selectSalesperson = (id: number) => {
  employeeId.value = id;
  salespersonOpen.value = false;
  salespersonSearch.value = '';
  onFilterChange();
};
const clearSalesperson = () => {
  employeeId.value = null;
  salespersonSearch.value = '';
  onFilterChange();
};
const selectCountry = (country: string) => {
  shipCountry.value = country;
  countryOpen.value = false;
  countrySearch.value = '';
  onFilterChange();
};
const clearCountry = () => {
  shipCountry.value = '';
  countrySearch.value = '';
  onFilterChange();
};

const buildFilters = (): OrderFilters => {
  return {
    search: search.value || undefined,
    sortBy: sortBy.value,
    sortDir: sortDir.value,
    customerId: customerId.value || undefined,
    employeeId: employeeId.value ?? undefined,
    orderDateStart: Array.isArray(orderDateRange.value) ? orderDateRange.value[0] : undefined,
    orderDateEnd: Array.isArray(orderDateRange.value) ? orderDateRange.value[1] : undefined,
    shippedDateStart: Array.isArray(shippedDateRange.value) ? shippedDateRange.value[0] : undefined,
    shippedDateEnd: Array.isArray(shippedDateRange.value) ? shippedDateRange.value[1] : undefined,
    shipCountry: shipCountry.value || undefined,
  };
};

async function load() {
  loading.value = true;
  error.value = null;
  try {
    result.value = await getOrders(page.value, pageSize.value, buildFilters());
  } catch (e) {
    error.value = 'Sorry, an error has occurred.';
  } finally {
    loading.value = false;
  }
}

const onSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { page.value = 1; load(); }, 350);
};

const saveFiltersToStore = () => {
  filterStore.save({
    customerId: customerId.value,
    employeeId: employeeId.value,
    shipCountry: shipCountry.value,
    orderDateRange: orderDateRange.value,
    shippedDateRange: shippedDateRange.value,
  });
};

const onFilterChange = () => {
  page.value = 1;
  saveFiltersToStore();
  load();
};

const clearSearch = () => {
  search.value = '';
  page.value = 1;
  load();
};

const clearAllFilters = () => {
  customerId.value = '';
  employeeId.value = null;
  orderDateRange.value = null;
  shippedDateRange.value = null;
  shipCountry.value = '';
  customerSearch.value = '';
  salespersonSearch.value = '';
  countrySearch.value = '';
  customerOpen.value = false;
  salespersonOpen.value = false;
  countryOpen.value = false;
  filterStore.clear();
  page.value = 1;
  load();
};

const sort = (column: string) => {
  if (sortBy.value === column) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDir.value = 'asc';
  }
  page.value = 1;
  load();
};

const sortIcon = (column: string): 'up' | 'down' | 'none' => {
  if (sortBy.value !== column) return 'none';
  return sortDir.value === 'asc' ? 'up' : 'down';
};

const { formatDatePadded } = useDate();

const route = useRouter().currentRoute;

onMounted(async () => {
  // Query params take priority — overwrite any saved store state
  const { from, to } = route.value.query;
  if (typeof from === 'string' && typeof to === 'string') {
    orderDateRange.value = [from, to];
    sort('orderDate');
  }

  const [customers, salespersons, countries] = await Promise.all([
    getCustomerLookups(),
    getSalespersonLookups(),
    getCountryLookups()
  ]);
  customerLookups.value = customers;
  salespersonLookups.value = salespersons;
  countryLookups.value = countries;
  await load();
});

watch(page, load);
watch([orderDateRange, shippedDateRange], onFilterChange);



</script>

<template>
  <div class="pageStyle">
    <!-- Header -->
    <div class="pageHeader mb-4">
      <h1>Orders</h1>
      <div class="searchContainer max-w-50">
        <MagnifyingGlassIcon class="searchIcon" />
        <input v-model="search" @input="onSearchInput" type="text" placeholder="Search orders..." class="searchInput" />
        <button v-if="search" @click="clearSearch" class="searchBtn">
          <XMarkIcon class="searchXIcon" />
        </button>
      </div>
    </div>

    <!-- Main layout: sidebar filters + table -->

    <div class="flex flex-col md:flex-row gap-4 items-start w-full">
      <!-- Filter Sidebar -->

      <aside class="w-full md:w-52 shrink-0 flex flex-col gap-1">

        <div v-if="activeFilterCount > 0" class="flex items-center justify-between mb-2">
          <div class="filterLabel">Selected filters</div>
          <button v-if="activeFilterCount > 0" @click="clearAllFilters" class="buttonSm">
            Clear all
          </button>
        </div>

        <!-- Active badges -->
        <div v-if="selectedCustomerLabel || selectedSalespersonLabel || selectedCountryLabel"
          class="flex flex-col gap-1.5 mb-2 ">
          <span v-if="selectedCustomerLabel" class="badgeSquare">
            {{ selectedCustomerLabel }}
            <button @click="clearCustomer" class="ml-auto hover:text-teal-600" aria-label="Remove customer filter">
              <XMarkIcon class="w-3.5 h-3.5" />
            </button>
          </span>
          <span v-if="selectedSalespersonLabel" class="badgeSquare">
            {{ selectedSalespersonLabel }}
            <button @click="clearSalesperson" class="ml-auto hover:text-teal-600"
              aria-label="Remove salesperson filter">
              <XMarkIcon class="w-3.5 h-3.5" />
            </button>
          </span>
          <span v-if="selectedCountryLabel" class="badgeSquare">
            {{ selectedCountryLabel }}
            <button @click="clearCountry" class="ml-auto hover:text-teal-600" aria-label="Remove country filter">
              <XMarkIcon class="w-3.5 h-3.5" />
            </button>
          </span>

        </div>

        <!-- Order Date Range (always visible) -->
        <div class="flex flex-col gap-1 mt-2">
          <label class="filterLabel">Order Date Range</label>
          <VueDatePicker v-model="orderDateRange" range :enable-time-picker="false" :month-change-on-scroll="false"
            placeholder="Select date range" model-type="yyyy-MM-dd" :formats="{ input: 'MM/dd/yyyy' }" :clearable="true"
            auto-apply />
        </div>

        <!-- Shipped Date Range (always visible) -->
        <div class="flex flex-col gap-1 mt-2">
          <label class="filterLabel">Shipped Date Range</label>
          <VueDatePicker v-model="shippedDateRange" range :enable-time-picker="false" :month-change-on-scroll="false"
            placeholder="Select date range" model-type="yyyy-MM-dd" :formats="{ input: 'MM/dd/yyyy' }" :clearable="true"
            auto-apply />
        </div>

        <!-- Customer dropdown -->
        <div class="flex flex-col mt-2">
          <button
            class="flex items-center justify-between w-full px-2 py-1.5 text-[13px] text-gray-700 font-medium border border-gray-200 rounded-lg bg-white hover:border-brand hover:text-brand cursor-pointer"
            @click="customerOpen = !customerOpen">
            <span>Customer</span>
            <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'rotate-180': customerOpen }" />
          </button>
          <div v-if="customerOpen" class="mt-1 flex flex-col gap-1">
            <input v-model="customerSearch" type="text" placeholder="Search..." class="filterSearch" />
            <ul class="filterList">
              <li v-for="c in filteredCustomers" :key="c.customerId" class="filterListItem"
                @mousedown.prevent="selectCustomer(c.customerId)">
                {{ c.customerName }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Salesperson dropdown -->
        <div class="flex flex-col mt-2">
          <button
            class="flex items-center justify-between w-full px-2 py-1.5 text-[13px] text-gray-700 font-medium border border-gray-200 rounded-lg bg-white hover:border-brand hover:text-brand cursor-pointer"
            @click="salespersonOpen = !salespersonOpen">
            <span>Salesperson</span>
            <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'rotate-180': salespersonOpen }" />
          </button>
          <div v-if="salespersonOpen" class="mt-1 flex flex-col gap-1">
            <input v-model="salespersonSearch" type="text" placeholder="Search..." class="filterSearch" />
            <ul class="filterList">
              <li v-for="s in filteredSalespersons" :key="s.employeeId" class="filterListItem"
                @mousedown.prevent="selectSalesperson(s.employeeId)">
                {{ s.fullName }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Country dropdown -->
        <div class="flex flex-col mt-2">
          <button
            class="flex items-center justify-between w-full px-2 py-1.5 text-[13px] text-gray-700 font-medium border border-gray-200 rounded-lg bg-white hover:border-brand hover:text-brand cursor-pointer"
            @click="countryOpen = !countryOpen">
            <span>Country</span>
            <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': countryOpen }" />
          </button>
          <div v-if="countryOpen" class="mt-1 flex flex-col gap-1">
            <input v-model="countrySearch" type="text" placeholder="Search..." class="filterSearch" />
            <ul class="filterList">
              <li v-for="c in filteredCountries" :key="c.country" class="filterListItem"
                @mousedown.prevent="selectCountry(c.country)">
                {{ c.country }}
              </li>
            </ul>
          </div>
        </div>

      </aside>

      <!-- Table / content area -->
      <div class="w-full md:flex-1 md:min-w-0">

        <div v-if="loading" class="flex flex-col items-center mt-20">
          <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
          <p class="text-lg text-gray-600 font-light">Loading ...</p>
        </div>
        <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>

        <template v-else-if="result">
          <!-- Results count -->
          <div class="mb-2 text-center w-full">
            <div v-if="result.totalCount > 0" class="text-[13px] text-gray-500">
              Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, result.totalCount) }}
              of {{ result.totalCount }} orders
            </div>
            <div v-else class="text-sm text-gray-500">no results</div>
          </div>

          <!-- Table (large screens) -->
          <div class="hidden lg:block tableWrap">
            <table class="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th class="tableThSortable" @click="sort('orderId')">
                    Order ID
                    <ChevronUpIcon v-if="sortIcon('orderId') === 'up'" class="sortIcon" />
                    <ChevronDownIcon v-else-if="sortIcon('orderId') === 'down'" class="sortIcon" />
                    <span v-else class="inline-block w-3 ml-1" />
                  </th>
                  <th class="tableThSortable" @click="sort('customerName')">
                    Customer
                    <ChevronUpIcon v-if="sortIcon('customerName') === 'up'" class="sortIcon" />
                    <ChevronDownIcon v-else-if="sortIcon('customerName') === 'down'" class="sortIcon" />
                    <span v-else class="inline-block w-3 ml-1" />
                  </th>
                  <th class="tableThSortable" @click="sort('salesPerson')">
                    Salesperson
                    <ChevronUpIcon v-if="sortIcon('salesPerson') === 'up'" class="sortIcon" />
                    <ChevronDownIcon v-else-if="sortIcon('salesPerson') === 'down'" class="sortIcon" />
                    <span v-else class="inline-block w-3 ml-1" />
                  </th>
                  <th class="tableThSortable" @click="sort('orderDate')">Order date
                    <ChevronUpIcon v-if="sortIcon('orderDate') === 'up'" class="sortIcon" />
                    <ChevronDownIcon v-else-if="sortIcon('orderDate') === 'down'" class="sortIcon" />
                    <span v-else class="inline-block w-3 ml-1" />
                  </th>
                  <th class="tableThSortable" @click="sort('shippedDate')">
                    Shipped date
                    <ChevronUpIcon v-if="sortIcon('shippedDate') === 'up'" class="sortIcon" />
                    <ChevronDownIcon v-else-if="sortIcon('shippedDate') === 'down'" class="sortIcon" />
                    <span v-else class="inline-block w-3 ml-1" />
                  </th>
                  <th class="tableThSortable" @click="sort('orderTotal')">
                    <div class="flex items-center justify-end">
                      Order Total
                      <ChevronUpIcon v-if="sortIcon('orderTotal') === 'up'" class="sortIcon" />
                      <ChevronDownIcon v-else-if="sortIcon('orderTotal') === 'down'" class="sortIcon" />
                      <span v-else class="inline-block w-3 ml-1" />
                    </div>
                  </th>
                  <!-- <th class="tableThSortable text-right" @click="sort('orderTotal')">Order total
                    <ChevronUpIcon v-if="sortIcon('orderTotal') === 'up'" class="sortIcon" />
                    <ChevronDownIcon v-else-if="sortIcon('orderTotal') === 'down'" class="sortIcon" />
                    <span v-else class="inline-block w-3 ml-1" />
                  </th> -->
                  <th class="tableThSortable" @click="sort('country')">
                    Country
                    <ChevronUpIcon v-if="sortIcon('country') === 'up'" class="sortIcon" />
                    <ChevronDownIcon v-else-if="sortIcon('country') === 'down'" class="sortIcon" />
                    <span v-else class="inline-block w-3 ml-1" />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in result.data" :key="order.orderId" class="hover:[&>td]:bg-gray-50">
                  <td class="tableTd font-medium text-gray-900">{{ order.orderId }}</td>
                  <td class="tableTd font-medium">{{ order.customerName }}</td>
                  <td class="tableTd">{{ order.salesPerson }}</td>
                  <td class="tableTd">{{ formatDatePadded(order.orderDate) }}</td>
                  <td class="tableTd" :class="{ 'text-amber-700': !order.shippedDate }">
                    {{ formatDatePadded(order.shippedDate) }}
                  </td>
                  <td class="tableTd text-right">{{ formatUSD(order.orderTotal) }}</td>
                  <td class="tableTd"><span class="badge">{{ order.shipCountry }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cards (small screens) -->
          <div class="lg:hidden flex flex-col gap-3 w-full">
            <div v-for="order in result.data" :key="order.orderId"
              class="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-gray-900">#{{ order.orderId }}</span>
                <span class="badge">{{ order.shipCountry }}</span>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ order.customerName }}</div>
                <div class="text-xs text-gray-500">{{ order.salesPerson }}</div>
              </div>
              <div class="border-t border-gray-100 pt-2 grid grid-cols-2 gap-y-1.5 text-xs">
                <div class="text-gray-500">Order date</div>
                <div class="text-gray-800 text-right">{{ formatDatePadded(order.orderDate) }}</div>
                <div class="text-gray-500">Shipped date</div>
                <div class="text-right" :class="order.shippedDate ? 'text-gray-800' : 'text-amber-700'">
                  {{ formatDatePadded(order.shippedDate) }}
                </div>
                <div class="text-gray-500">Order Total</div>
                <div class="text-gray-800 text-right">{{ formatUSD(order.orderTotal) }}</div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="showPagination && result.totalPages > 1" class="pagination">
            <button class="pageBtn hidden md:block" :disabled="page === 1" @click="page = 1">«</button>
            <button class="pageBtn" :disabled="page === 1" @click="page--">‹</button>
            <template v-for="p in pageNumbers" :key="p">
              <span v-if="p === '...'" class="pageEllipsis">…</span>
              <button v-else class="pageBtn" :class="{ 'pageBtnActive': p === page }" @click="page = (p as number)">
                {{ p }}
              </button>
            </template>
            <button class="pageBtn" :disabled="page === result.totalPages" @click="page++">›</button>
            <button class="pageBtn hidden md:block" :disabled="page === result.totalPages"
              @click="page = result.totalPages">»</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.filterList {
  @apply m-0 p-0 list-none border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto;
}

.filterListItem {
  @apply px-2.5 py-1.5 text-[12px] text-gray-700 cursor-pointer select-none;
}

.filterListItem:hover {
  @apply bg-teal-50 text-teal-800;
}

/* Vue Datepicker overrides */
:deep(.dp__main) {
  font-size: 11px;
}

:deep(.dp__input) {
  font-size: 11px;
  padding: 5px 8px 5px 28px;
}

:deep(.dp__icon) {
  width: 13px;
  height: 13px;
}

:deep(.dp__menu) {
  font-size: 11px;
  min-width: 200px;
}

:deep(.dp__calendar_header_item) {
  font-size: 11px;
  padding: 2px;
}

:deep(.dp__cell_inner) {
  width: 24px;
  height: 24px;
  font-size: 11px;
}

:deep(.dp__month_year_select) {
  font-size: 11px;
}

:deep(.dp__action_button) {
  font-size: 11px;
  padding: 2px 8px;
}
</style>