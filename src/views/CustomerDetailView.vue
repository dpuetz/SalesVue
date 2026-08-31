<script setup lang="ts">

import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { getCustomerDetail } from '@/services/customerService';
import type { CustomerDetail } from '@/types/customerDetail';
import type { RecentOrder } from '@/types/dashboard';
import { useCurrency } from '@/composables/useCurrency';
import { useMonth } from '@/composables/useMonth';
import { useDate } from '@/composables/useDate';
import OrderTable from '@/components/OrderTable.vue';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent]);

const props = defineProps<{ id: string }>();
const router = useRouter();
const { formatUSD } = useCurrency();
const { monthName } = useMonth();
const { formatDate } = useDate();

const route = useRouter().currentRoute;
const startDate = computed(() => (route.value.query.from as string) ?? '2025-01-01');
const endDate = computed(() => (route.value.query.to as string) ?? '2025-12-31');

const data = ref<CustomerDetail | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;

  try {
    data.value = await getCustomerDetail(props.id, startDate.value, endDate.value);
  } catch {
    error.value = 'Sorry, an error has occurred.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => props.id, load);

// --- Pagination ---
const PAGE_SIZE = 10;
const currentPage = ref(1);

const totalPages = computed(() =>
  data.value ? Math.ceil(data.value.orders.length / PAGE_SIZE) : 0
);

const pagedOrders = computed<RecentOrder[]>(() => {
  if (!data.value) return [];
  const start = (currentPage.value - 1) * PAGE_SIZE;

  return data.value.orders.slice(start, start + PAGE_SIZE).map(order => ({
    orderId: order.orderId,
    orderDate: order.orderDate,
    orderTotal: order.orderTotal,
    status: order.status,
    customerName: ''
  }));
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const cur = currentPage.value;
  const pages: (number | '...')[] = [1];
  if (cur > 3) pages.push('...');
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});

watch(data, () => { currentPage.value = 1; });

// --- Charts ---
const revenueChartOption = computed(() => {
  if (!data.value) return {};
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (p: any) => `${p[0].name}<br/>${formatUSD(p[0].value)}`
    },
    grid: { left: 16, right: 16, top: 8, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.value.revenueByMonth.map(m => monthName(m.month)),
      axisLabel: { fontSize: 11 }
    },
    yAxis: { type: 'value', show: true },
    series: [{
      type: 'bar',
      data: data.value.revenueByMonth.map(m => m.revenue),
      itemStyle: { color: '#9FE1CB', borderRadius: [4, 4, 0, 0] },
      emphasis: { itemStyle: { color: '#0F6E56' } }
    }]
  };
});

const goToSalesperson = (employeeId: number) => {
  router.push({
    name: 'SalespersonDetail',
    params: { id: employeeId },
    query: { from: startDate.value, to: endDate.value }
  });
};

</script>

<template>
  <div class="pageStyle">

    <!-- Breadcrumb -->
    <div class="pageHeader">
      <nav class="flex items-center gap-2 text-sm">
        <button class="text-teal-700 hover:underline font-medium" @click="router.back()">
          ← Back
        </button>
        <span class="text-gray-400">/</span>
        <span class="text-gray-700 font-medium">{{ data?.customerName ?? 'Customer' }}</span>
      </nav>
      <h1 class="text-lg font-medium text-gray-900">Customer details</h1>
      <div class="text-xs text-gray-400">{{ formatDate(startDate) }} → {{ formatDate(endDate) }}</div>
    </div>

    <div v-if="loading" class="flex flex-col items-center mt-30  min-h-screen">
      <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
      <p class="text-lg text-gray-600 font-light">Loading ...</p>
    </div>
    <div v-else-if="error" class="text-red-600 text-sm">{{ error }}</div>

    <template v-if="data">

      <!-- KPI cards -->
      <div class="kpiGrid">
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Total revenue</div>
          <div class="text-xl font-medium text-gray-900">{{ formatUSD(data.kpis.totalRevenue) }}</div>
        </div>
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Total orders</div>
          <div class="text-xl font-medium text-gray-900">{{ data.kpis.totalOrders.toLocaleString() }}</div>
        </div>
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Avg order value</div>
          <div class="text-xl font-medium text-gray-900">{{ formatUSD(data.kpis.avgOrderValue) }}</div>
        </div>
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Shipped</div>
          <div class="text-xl font-medium text-gray-900">{{ data.kpis.shippedOrders.toLocaleString() }}</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ data.kpis.pendingOrders }} pending</div>
        </div>
      </div>

      <!-- Revenue by month -->
      <div class="row row1 mb-4">
        <div class="card">
          <div class="cardTitle">Revenue by month</div>
          <VChart :option="revenueChartOption" style="height:240px" autoresize />
        </div>
      </div>

      <!-- Orders + salesperson breakdown -->
      <div class="row row2">

        <!-- Paginated orders -->
        <OrderTable title="Orders" :orders="pagedOrders" show-status :page-size="10" />

        <!-- Salesperson breakdown -->
        <div class="card">
          <div class="cardTitle">Salesperson breakdown</div>
          <div class="tableRow cursor-pointer hover:bg-gray-50 rounded-lg px-1 -mx-1 transition-colors"
            v-for="s in data.salespersonBreakdown" :key="s.employeeId" @click="goToSalesperson(s.employeeId)">
            <span class="text-sm text-gray-900 flex-1">{{ s.salesPerson }}</span>
            <span class="text-xs text-gray-400 shrink-0 mr-3">{{ s.orderCount }} orders</span>
            <span class="text-sm font-medium shrink-0">{{ formatUSD(s.revenue) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>