<script setup lang="ts">

import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
//charts
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';
//stores
import { useDashboardFiltersStore } from '@/stores/dashboardFilters.ts';
//services
import { getDashboardData } from '@/services/dashboardService';
//types
import type { DashboardData } from '@/types/dashboard';
// import type { OrderFilters } from '@/types/order'
//composables
import { useCurrency } from '@/composables/useCurrency';
import { useMonth } from '@/composables/useMonth';
import { useDate } from '@/composables/useDate';
import { useInitials } from '@/composables/useInitials';
import OrderTable from '@/components/OrderTable.vue';
//icons
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

use([CanvasRenderer, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent]);

//data
const router = useRouter();
const { formatUSD } = useCurrency();
const { monthName } = useMonth();
const { formatDate } = useDate();
const { initials } = useInitials();
const filterStore = useDashboardFiltersStore();

const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const data = ref<DashboardData | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

//on load, set default dates to the store dates if store dates exist
const orderDateRange = ref<string[] | null>(filterStore.orderDateRange);
startDate.value = orderDateRange.value?.[0] ?? '2025-01-01';
endDate.value = orderDateRange.value?.[1] ?? '2025-12-31';

const dateError = computed(() => {
  if (!startDate.value || !endDate.value) return null;
  if (startDate.value > endDate.value) return 'End date must be after start date.';
  return null;
});

const colorScale = [
  '#3D51A1', '#539DD5', '#7BBAE6', '#AAD6F5', '#BDE0F8',
  '#DCF0FD', '#DFF1FD', '#F7C591', '#F7B377', '#F3A26D',
  '#ED875E', '#E67856', '#E37152', '#DC614B', '#DC604A',
  '#D65440', '#D55240'
];

function colorForIndex(index: number, total: number): string {
  const ratio = total <= 1 ? 0 : index / (total - 1);
  return colorScale[Math.round(ratio * (colorScale.length - 1))] ?? '#0F6E56';
}

const employeeChartOption = () => {
  const maxRevenue = Math.max(...data.value!.revenueByEmployee.map(r => r.revenue));
  const maxLabel = formatUSD(maxRevenue);
  const rightMargin = maxLabel.length * 7.5 + 8;

  return {
    tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0].name}<br/>${formatUSD(p[0].value)}` },
    grid: { left: 120, right: rightMargin, top: 8, bottom: 8, containLabel: false },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      data: data.value!.revenueByEmployee.map(r => r.salesPerson).reverse(),
      axisLabel: { fontSize: 12 }
    },
    series: [{
      type: 'bar',
      data: data.value!.revenueByEmployee.map(r => Math.round(r.revenue)).reverse(),
      itemStyle: { color: '#0F6E56', borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', formatter: (p: any) => formatUSD(p.value), fontSize: 11 },
      cursor: 'pointer'
    }]
  };
};

const monthlyChartOption = () => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      const idx = params[0].dataIndex;
      const item = data.value!.ordersByMonth[idx];
      return `${monthName(item!.month)} ${item!.year}<br/>${item!.orderCount} orders`;
    }
  },
  grid: { left: 32, right: 16, top: 8, bottom: 24, containLabel: false },
  xAxis: {
    type: 'category',
    data: data.value!.ordersByMonth.map(m => `${monthName(m.month)} ${m.year}`),
    axisLabel: { fontSize: 11 }
  },
  yAxis: { type: 'value', show: true },
  series: [{
    type: 'bar',
    data: data.value!.ordersByMonth.map(m => m.orderCount),
    itemStyle: { color: '#9FE1CB', borderRadius: [4, 4, 0, 0] },
    emphasis: { itemStyle: { color: '#0F6E56' } }
  }]
});

const donutOption = (small = false) => {
  const sorted = [...data.value!.revenueByEmployee].sort((a, b) => b.revenue - a.revenue);
  const total = sorted.reduce((s, d) => s + d.revenue, 0);

  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.name}<br/>${formatUSD(p.value)}<br/>${p.percent.toFixed(1)}%`
    },
    legend: {
      orient: 'horizontal', bottom: 0, left: 'center',
      itemWidth: 10, itemHeight: 10,
      textStyle: { fontSize: 11, color: '#374151' },
      formatter: (name: string) => {
        const item = sorted.find(d => d.salesPerson === name);
        return item ? `${name}  ${((item.revenue / total) * 100).toFixed(1)}%` : name;
      }
    },
    series: [{
      type: 'pie',
      radius: small ? ['42%', '65%'] : ['35%', '65%'],
      center: ['50%', '35%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: !small },
      emphasis: { label: { show: !small } },
      data: sorted.map((d, i) => ({
        name: d.salesPerson,
        value: Math.round(d.revenue),
        itemStyle: { color: colorForIndex(i, sorted.length) }
      }))
    }]
  };
};

//this is for changing donutOption depending on screen width
const isLg = ref(window.matchMedia('(min-width: 1024px)').matches);
const mq = window.matchMedia('(min-width: 1024px)');
const handler = (e: MediaQueryListEvent) => isLg.value = e.matches;
mq.addEventListener('change', handler);
onUnmounted(() => mq.removeEventListener('change', handler));

// Add a separate ref for the last successfully loaded range
const appliedStartDate = ref<string | null>(startDate.value);
const appliedEndDate = ref<string | null>(endDate.value);

async function load() {
  if (dateError.value) return;
  loading.value = true;
  saveFiltersToStore();
  error.value = null;
  try {
    data.value = await getDashboardData(startDate.value, endDate.value);
    appliedStartDate.value = startDate.value;
    appliedEndDate.value = endDate.value;
  } catch (e) {
    error.value = 'Sorry, an error has occurred.';
  } finally {
    loading.value = false;
  }
}

const goToSalesperson = (id: number) => {

  router.push({
    name: 'SalespersonDetail',
    params: { id },
    query: { from: appliedStartDate.value, to: appliedEndDate.value }   // preserve date range
  });
};

const goToCustomer = (id: string) => {
  router.push({
    name: 'CustomerDetail',
    params: { id },
    query: { from: appliedStartDate.value, to: appliedEndDate.value }
  });
};

const goToMonth = (year: number, month: number) => {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();  // day 0 of next month = last day of this month
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  router.push({ name: 'orders', query: { from, to } });
};

const saveFiltersToStore = () => {
  if (!startDate.value || !endDate.value) return;
  orderDateRange.value = [startDate.value, endDate.value];
  filterStore.save({
    orderDateRange: orderDateRange.value,
  });
};


onMounted(load);

</script>

<template>
  <div class="pageStyle">
    <!-- Header -->
    <div class="pageHeader">
      <h1>Sales Dashboard</h1>
      <div class="flex items-center gap-2 flex-wrap">
        <input type="date" v-model="startDate" class="date" />
        <span class="text-sm text-gray-500">to</span>
        <input type="date" v-model="endDate" class="date" />
        <button class="buttonPrimary" @click="load" :disabled="loading">
          {{ loading ? 'Loading...' : 'Apply' }}
        </button>
      </div>
      <div v-if="dateError" class="basis-full text-amber-700 text-sm text-right pr-32">{{ dateError }}</div>
    </div>

    <div v-if="loading" class="flex flex-col items-center mt-30  min-h-screen">
      <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
      <p class="text-lg text-gray-600 font-light">Loading ...</p>
    </div>

    <div v-else-if="error" class="text-red-600 text-sm mb-4">{{ error }}</div>

    <template v-if="data">

      <!-- KPI cards -->
      <div class="kpiGrid">
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Total revenue</div>
          <div class="text-xl font-medium text-gray-900">{{ formatUSD(data.summary.totalRevenue) }}</div>
        </div>
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Total orders</div>
          <div class="text-xl font-medium text-gray-900">{{ data.summary.totalOrders.toLocaleString() }}</div>
        </div>
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Avg order value</div>
          <div class="text-xl font-medium text-gray-900">{{ formatUSD(data.summary.avgOrderValue) }}</div>
        </div>
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Shipped</div>
          <div class="text-xl font-medium text-gray-900">{{ data.summary.shippedOrders.toLocaleString() }}</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ data.summary.pendingOrders }} pending</div>
        </div>
      </div>

      <!-- Row 1: salesperson bar + monthly orders -->
      <div class="row row2">
        <div class="card">
          <div class="cardTitle">Revenue by salesperson</div>
          <VChart :option="employeeChartOption()" :style="{ height: data.revenueByEmployee.length * 40 + 'px' }"
            autoresize @click="(e) => {
              const emp = data!.revenueByEmployee.find(r => r.salesPerson === e.name)
              if (emp) goToSalesperson(emp.employeeId)
            }" />
        </div>
        <div class="card">
          <div class="cardTitle">Orders by month</div>
          <VChart :option="monthlyChartOption()" style="height:250px" autoresize @click="(e) => {
            const idx = e.dataIndex
            const item = data!.ordersByMonth[idx]
            goToMonth(item!.year, item!.month)
          }" />
        </div>
      </div>

      <!-- Row 2: recent orders + donut -->
      <div class="row row2">
        <OrderTable title="Recent Orders" :orders="data.recentOrders" :page-size="10" />

        <div class="card">
          <div class="cardTitle">Revenue by salesperson share</div>

          <VChart :option="donutOption(!isLg)" style="height:350px" autoresize @click="(e) => {
            const emp = data!.revenueByEmployee.find(r => r.salesPerson === e.name)
            if (emp) goToSalesperson(emp.employeeId)
          }" />

        </div>
      </div>

      <!-- Row 3: top customers + recently acquired accounts -->
      <div class="row row2">
        <div class="card">
          <div class="cardTitle">Top customers</div>
          <div class="tableRow cursor-pointer" v-for="c in data.topCustomers" :key="c.customerId"
            @click="goToCustomer(c.customerId)">
            <span class="text-sm text-gray-900 flex-1">{{ c.customerName }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">{{ c.country }}</span>
            <span class="text-sm font-medium">{{ formatUSD(c.revenue) }}</span>
          </div>
        </div>
        <div class="card">
          <div class="cardTitle">Recently acquired accounts</div>
          <div class="tableRow" v-for="a in data.recentAccounts" :key="a.customerId">
            <div class="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 
              text-[0.7rem] sm:text-xs font-medium">
              {{ initials(a.companyName) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900">{{ a.companyName }}</div>
              <div class="text-xs text-gray-500 truncate">{{ a.city }}, {{ a.country }} · {{ formatDate(a.createdDate)
              }}</div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 shrink-0">New</span>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped></style>