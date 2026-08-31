<script setup lang="ts">

import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { getSalespersonDetail } from '@/services/salespersonService';
import type { SalespersonDetail } from '@/types/salespersonDetail';
import { useCurrency } from '@/composables/useCurrency';
import { useMonth } from '@/composables/useMonth';
import { useDate } from '@/composables/useDate';
import OrderTable from '@/components/OrderTable.vue';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent]);

const props = defineProps<{ id: string }>();
const router = useRouter();
const { formatUSD } = useCurrency();
const { monthName } = useMonth();
const { formatDate } = useDate();

const route = useRouter().currentRoute;
const startDate = computed(() => (route.value.query.from as string) ?? '2025-01-01');
const endDate = computed(() => (route.value.query.to as string) ?? '2025-12-31');

const data = ref<SalespersonDetail | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    data.value = await getSalespersonDetail(Number(props.id), startDate.value, endDate.value);
  } catch {
    error.value = 'Sorry, an error has occurred.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => props.id, load);

const goToCustomer = (id: string) => {
  router.push({
    name: 'CustomerDetail',
    params: { id },
    query: { from: startDate.value, to: endDate.value }
  });
};

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
</script>

<template>
  <div class="pageStyle">

    <!-- Breadcrumb -->
    <div class="pageHeader">
      <nav class="flex items-center gap-2 text-sm">
        <button class="text-teal-700 hover:underline font-medium" @click="router.back()">
          ← Dashboard
        </button>
        <span class="text-gray-400">/</span>
        <span class="text-gray-700 font-medium">
          {{ data?.salesPerson ?? 'Salesperson' }}
        </span>
      </nav>

      <h1 class="text-lg font-medium text-gray-900">Salesperson Details</h1>

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

      <!-- Orders + top customers -->
      <div class="row row2">
        <OrderTable title="Orders" :orders="data.orders" show-status :page-size="10" />
        <div class="card">
          <div class="cardTitle">Top customers</div>
          <div class="tableRow cursor-pointer" v-for="c in data.topCustomers" :key="c.customerId"
            @click="goToCustomer(c.customerId)">
            <span class="text-sm text-gray-900 flex-1">{{ c.customerName }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">{{ c.country }}</span>
            <span class="text-sm font-medium">{{ formatUSD(c.revenue) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>