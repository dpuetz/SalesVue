<script setup lang="ts">

import { ref, onMounted, watch, computed, nextTick } from 'vue';
//echart imports
import { use, registerMap } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { MapChart, EffectScatterChart } from 'echarts/charts';
import { TooltipComponent, VisualMapComponent } from 'echarts/components';
import VChart from 'vue-echarts';
//services
import { getSalesByCountry } from '@/services/dashboardService';
import { getCountrySalesPerson, getCountryCustomer } from '@/services/orderService';
//types
import type { CountrySales } from '@/types/dashboard';
import type { CountrySalesPerson, CountryCustomer } from '@/types/order';
//icons
import { ArrowPathIcon } from '@heroicons/vue/24/outline';
//composables
import { useDate } from '@/composables/useDate';

use([CanvasRenderer, MapChart, EffectScatterChart, TooltipComponent, VisualMapComponent]);

const startDate = ref('2024-01-01');
const endDate = ref('2026-12-31');
const data = ref<CountrySales[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const mapReady = ref(false);
const { formatDatePadded } = useDate();

//selected country
const tableSection = ref<HTMLElement | null>(null);
const selectedCountry = ref<string | null>(null);
const activeView = ref<'countries' | 'salesperson' | 'customer'>('countries');
const salesPersonData = ref<CountrySalesPerson[]>([]);
const spLoading = ref(false);
const spError = ref<string | null>(null);
const customerData = ref<CountryCustomer[]>([]);
const custLoading = ref(false);
const custError = ref<string | null>(null);

const currency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const countryCoords: Record<string, [number, number]> = {
  'Argentina': [-63.6167, -38.4161],
  'Austria': [14.5501, 47.5162],
  'Belgium': [4.4699, 50.5039],
  'Brazil': [-51.9253, -14.2350],
  'Canada': [-96.8165, 56.1304],
  'Denmark': [9.5018, 56.2639],
  'Finland': [25.7482, 61.9241],
  'France': [2.2137, 46.2276],
  'Germany': [10.4515, 51.1657],
  'Ireland': [-8.2439, 53.4129],
  'Italy': [12.5674, 41.8719],
  'Mexico': [-102.5528, 23.6345],
  'Norway': [8.4689, 60.4720],
  'Poland': [19.1451, 51.9194],
  'Portugal': [-8.2245, 39.3999],
  'Spain': [-3.7492, 40.4637],
  'Sweden': [18.6435, 60.1282],
  'Switzerland': [8.2275, 46.8182],
  'UK': [-3.4360, 55.3781],
  'USA': [-95.7129, 37.0902],
  'Venezuela': [-66.5897, 6.4238],
};

const maxRevenue = computed(() =>
  data.value.length ? Math.max(...data.value.map(d => d.revenue)) : 1
);

const showCountryIcon = computed(() => activeView.value === 'salesperson' || activeView.value === 'customer');

const scatterData = computed(() =>
  data.value
    .filter(d => countryCoords[d.country] !== undefined)
    .map(d => ({
      name: d.country,
      value: [...countryCoords[d.country]!, Math.round(d.revenue)] as [number, number, number],
      orderCount: d.orderCount,
      revenue: d.revenue
    }))
);

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    formatter: (p: any) => {
      if (p.seriesType === 'effectScatter') {
        return `<b>${p.name}</b><br/>Revenue: ${currency(p.data.revenue)}<br/>Orders: ${p.data.orderCount}`;
      }
      return p.name;
    }
  },
  visualMap: {
    min: 0,
    max: maxRevenue.value,
    show: true,
    orient: 'vertical',
    left: 'right',
    bottom: 'bottom',
    text: ['High', 'Low'],
    textStyle: { color: '#444' },
    inRange: { color: ['#ebeb0e', '#eb9f34', '#eb3434'] },
    formatter: (value: number) => currency(value)
  },
  geo: {
    map: 'world',
    roam: true,
    itemStyle: { areaColor: '#e8f5f1', borderColor: '#b2d8cc', borderWidth: 0.5 },
    emphasis: { itemStyle: { areaColor: '#9FE1CB' } },
    scaleLimit: { min: 1, max: 8 }
  },
  series: [{
    type: 'effectScatter',
    coordinateSystem: 'geo',
    data: scatterData.value,
    symbolSize: (val: [number, number, number]) => {
      const ratio = val[2] / maxRevenue.value;
      return Math.max(8, Math.round(ratio * 40));
    },
    encode: { value: 2 },
    rippleEffect: { brushType: 'stroke', scale: 2.5 },
    itemStyle: {
      color: (params: any) => {
        const ratio = params.data.value[2] / maxRevenue.value;
        if (ratio > 0.66) return '#4940ed';
        if (ratio > 0.33) return '#EF9F27';
        return '#0df3ff';
      }
    },
    label: { show: false }
  }]
}));

//respond to chart clicks
async function onChartClick(event: any) {
  if (event.seriesType !== 'effectScatter') return;
  const country = event.name as string;
  if (selectedCountry.value === country) {
    selectedCountry.value = null;
    salesPersonData.value = [];
    customerData.value = [];
    activeView.value = 'countries';
  } else {
    selectedCountry.value = country;
    salesPersonData.value = [];
    customerData.value = [];
    activeView.value = 'salesperson';
    loadSalesPerson();
    await nextTick();
    if (tableSection.value) {
      const rect = tableSection.value.getBoundingClientRect();
      window.scrollTo({ top: rect.top + window.scrollY + -95, behavior: 'smooth' });
    }
  }
}

//response to chart clicks
async function loadSalesPerson() {
  if (!selectedCountry.value) return;
  spLoading.value = true;
  spError.value = null;
  try {
    salesPersonData.value = await getCountrySalesPerson(
      selectedCountry.value,
      startDate.value,
      endDate.value
    );
  } catch (e) {
    spError.value = 'Sorry, an error has occurred.';
  } finally {
    spLoading.value = false;
  }
}

async function loadCustomer() {
  if (!selectedCountry.value) return;
  custLoading.value = true;
  custError.value = null;
  try {
    customerData.value = await getCountryCustomer(
      selectedCountry.value,
      startDate.value,
      endDate.value
    );
  } catch (e) {
    custError.value = 'Sorry, an error has occurred.';
  } finally {
    custLoading.value = false;
  }
}

function setView(view: 'countries' | 'salesperson' | 'customer') {
  if ((view === 'salesperson' || view === 'customer') && !selectedCountry.value) return;
  activeView.value = view;
  if (view === 'salesperson' && selectedCountry.value && !salesPersonData.value.length) {
    loadSalesPerson();
  }
  else if (view === 'customer' && selectedCountry.value && !customerData.value.length) {
    loadCustomer();
  }
}

async function load() {
  error.value = null;
  try {
    data.value = await getSalesByCountry(startDate.value, endDate.value);
  } catch (e) {
    error.value = 'Sorry, an error has occurred.';
  } finally {
    loading.value = false;
  }
}

//response to chart clicks
// Re-fetch salesperson data if dates change while that view is active
watch([startDate, endDate], () => {
  load();
  if (activeView.value === 'salesperson' && selectedCountry.value) {
    loadSalesPerson();
  }
  if (activeView.value === 'customer' && selectedCountry.value) {
    loadCustomer();
  }
});

onMounted(async () => {
  const worldJson = await import('@/assets/world.json');
  registerMap('world', worldJson.default as any);
  mapReady.value = true;
  await load();
});
</script>

<template>
  <div class="pageStyle">
    <div class="pageHeader">
      <h1>Sales by Country</h1>
      <div class="flex items-center gap-2 flex-wrap">
        <input type="date" v-model="startDate" class="date" />
        <span class="text-sm text-gray-500">to</span>
        <input type="date" v-model="endDate" class="date" />
        <button class="buttonPrimary" @click="load" :disabled="loading">
          {{ loading ? 'Loading...' : 'Apply' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center mt-30 min-h-screen">
      <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
      <p class="text-lg text-gray-600 font-light">Loading ...</p>
    </div>
    <div v-if="error" class="text-[14px] mb-4 text-red-600">{{ error }}</div>

    <div class="card mb-4" v-if="mapReady">
      <VChart :option="chartOption" style="height: 320px;" autoresize @click="onChartClick" />
    </div>

    <!-- Table section -->
    <div class="w-full md:w-3/4 lg:w-1/2 mx-auto">
      <div class="flex justify-end text-[11px] text-gray-600 tracking-wide
    font-medium mb-1 px-4">
        <div>from {{ formatDatePadded(startDate) }} to {{ formatDatePadded(endDate) }}</div>
      </div>

      <div ref="tableSection" class="tableCard " v-if="data.length">
        <div class="flex items-center justify-between p-3 border-b border-gray-200 gap-2">
          <div class="flex gap-2">
            <button class="optBtn" :class="{ optActive: activeView === 'countries' }" @click="setView('countries')">
              By Country
            </button>
            <button class="optBtn" :class="{ optActive: activeView === 'salesperson', optDisabled: !selectedCountry }"
              :disabled="!selectedCountry" @click="setView('salesperson')">
              By Salesperson
            </button>
            <button class="optBtn" :class="{ optActive: activeView === 'customer', optDisabled: !selectedCountry }"
              :disabled="!selectedCountry" @click="setView('customer')">
              By Customer
            </button>
          </div>
          <div>
            <div v-if="selectedCountry && showCountryIcon" class="badgeLg">
              {{ selectedCountry }}
            </div>

          </div>
        </div>

        <!-- By Country -->
        <table v-if="activeView === 'countries'" class="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th class="text-left thStyle">Country</th>
              <th class="text-right thStyle">Revenue</th>
              <th class="text-right thStyle">Orders</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in data" :key="d.country" class="hover:bg-gray-50 cursor-pointer"
              :class="{ 'bg-indigo-50': d.country === selectedCountry }">
              <td class="tdStyle">{{ d.country }}</td>
              <td class="text-right tdStyle">{{ currency(d.revenue) }}</td>
              <td class="text-right tdStyle">{{ d.orderCount }}</td>
            </tr>
          </tbody>
        </table>

        <!-- By Salesperson -->
        <div v-if="activeView === 'salesperson'">
          <div v-if="spLoading" class="flex items-center gap-2 p-4 text-gray-500 text-sm">
            <ArrowPathIcon class="h-4 w-4 animate-spin" /> Loading...
          </div>
          <div v-else-if="spError" class="text-red-600 text-[14px] p-4">{{ spError }}</div>
          <table v-else class="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th class="text-left thStyle">Salesperson</th>
                <th class="text-right thStyle">Revenue</th>
                <th class="text-right thStyle">Orders</th>

              </tr>
            </thead>
            <tbody>
              <tr v-for="d in salesPersonData" :key="d.EmployeeId" class="hover:bg-gray-50">
                <td class="tdStyle">{{ d.salesPerson }}</td>
                <td class="text-right tdStyle">{{ currency(d.totalSales) }}</td>
                <td class="text-right tdStyle">{{ d.orderCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- By Customer -->
        <div v-if="activeView === 'customer'">
          <div v-if="custLoading" class="flex items-center gap-2 p-4 text-gray-500 text-sm">
            <ArrowPathIcon class="h-4 w-4 animate-spin" /> Loading...
          </div>
          <div v-else-if="custError" class="text-red-600 text-[14px] p-4">{{ custError }}</div>
          <table v-else class="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th class="text-left thStyle">Customer</th>
                <th class="text-right thStyle">Revenue</th>
                <th class="text-right thStyle">Orders</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in customerData" :key="d.customerId" class="hover:bg-gray-50">
                <td class="tdStyle">{{ d.companyName }}</td>
                <td class="text-right tdStyle">{{ currency(d.totalSales) }}</td>
                <td class="text-right tdStyle">{{ d.orderCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
      <div class="h-96" />
    </div>
  </div>

</template>

<style scoped>
@reference "@/assets/main.css";

.thStyle {
  @apply text-[11px] text-gray-400 uppercase tracking-wide px-4 py-3 border-b border-gray-200 font-medium
}

.tdStyle {
  @apply px-4 py-2.5 border-b border-gray-100
}

.optBtn {
  @apply px-3 py-1.5 text-[12px] cursor-pointer font-medium rounded-full border border-gray-300 text-gray-500 bg-white hover:border-indigo-400 hover:text-indigo-600 transition-colors duration-150
}

.optActive {
  @apply bg-indigo-600 text-white border-indigo-600 hover:text-white hover:border-indigo-600
}

.optDisabled {
  @apply opacity-40 cursor-not-allowed pointer-events-none
}

.countryIcon {
  @apply px-3 py-1.5 text-[12px] font-medium border border-gray-300 text-white bg-teal-700 rounded-lg text-sm disabled:opacity-60;
}
</style>