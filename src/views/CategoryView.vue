<script setup lang="ts">

import { ref, onMounted, computed, onUnmounted } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { getCategorySales } from '@/services/categoryService';
import type { CategorySales } from '@/types/category';
import { useCurrency } from '@/composables/useCurrency';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

use([CanvasRenderer, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent]);

const startDate = ref('2024-01-01');
const endDate = ref('2026-12-31');
const data = ref<CategorySales[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const { formatUSD } = useCurrency();

// 17-stop color scale — index 0 = highest revenue (dark blue), last = lowest (dark red)
const colorScale = [
  '#3D51A1', '#539DD5', '#7BBAE6', '#AAD6F5', '#BDE0F8',
  '#DCF0FD', '#DFF1FD', '#F7C591', '#F7B377', '#F3A26D',
  '#ED875E', '#E67856', '#E37152', '#DC614B', '#DC604A',
  '#D65440', '#D55240'
];

function colorForIndex(index: number, total: number): string {
  const ratio = total <= 1 ? 0 : index / (total - 1);
  const colorIndex = Math.round(ratio * (colorScale.length - 1));
  return colorScale[colorIndex] ?? '#3D51A1';
}

const processedCategories = computed(() => {

  if (!data.value || data.value.length === 0) return [];

  // 1. Calculate total revenue once
  const totalRevenue = data.value.reduce((sum, item) => sum + item.revenue, 0);

  // 2. Sort data safely without mutating the original array
  const sortedData = [...data.value].sort((a, b) => b.revenue - a.revenue);

  // 3. Map into a ready-to-render array
  return sortedData.map((item, index) => ({
    ...item,
    formattedRevenue: formatUSD(item.revenue),
    share: totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) + '%' : '0.0%',
    dotColor: colorForIndex(index, data.value.length)
  }));
});

const chartOption = computed(() => {
  const sorted = [...data.value].sort((a, b) => b.revenue - a.revenue);
  const categories = sorted.map(d => d.categoryName).reverse();
  const values = sorted.map(d => Math.round(d.revenue)).reverse();
  const colors = sorted.map((_, i) => colorForIndex(i, sorted.length)).reverse();

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p: any) => `${p[0].name}<br/>${formatUSD(p[0].value)}`
    },
    grid: { left: 120, right: 100, top: 16, bottom: 8, containLabel: false },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: { fontSize: 13, color: '#374151' },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [{
      type: 'bar',
      data: values.map((v, i) => ({
        value: v,
        itemStyle: { color: colors[i], borderRadius: [0, 4, 4, 0] }
      })),
      label: {
        show: true,
        position: 'right',
        formatter: (p: any) => formatUSD(p.value),
        fontSize: 12,
        color: '#374151'
      },
      barMaxWidth: 48
    }]
  };
});
const donutOption = (small = false) => {
  const sorted = [...data.value].sort((a, b) => b.revenue - a.revenue);
  const total = sorted.reduce((s, d) => s + d.revenue, 0);

  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.name}<br/>${formatUSD(p.value)}<br/>${p.percent.toFixed(1)}%`
    },
    legend: small
      ? {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        itemWidth: 10, itemHeight: 10,
        textStyle: { fontSize: 11, color: '#374151' },
        formatter: (name: string) => {
          const item = sorted.find(d => d.categoryName === name);
          return item ? `${name}  ${((item.revenue / total) * 100).toFixed(1)}%` : name;
        }
      }
      : {
        orient: 'vertical',
        right: 16,
        top: 'center',
        itemWidth: 10, itemHeight: 10,
        borderRadius: 50,
        textStyle: { fontSize: 12, color: '#374151' },
        formatter: (name: string) => {
          const item = sorted.find(d => d.categoryName === name);
          return item ? `${name}  ${((item.revenue / total) * 100).toFixed(1)}%` : name;
        }
      },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: small ? ['50%', '35%'] : ['38%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: !small,
        position: 'outside',
        formatter: (p: any) => `${p.name}\n${formatUSD(p.value)}`,
        fontSize: 11, color: '#374151', lineHeight: 16
      },
      labelLine: { show: !small, length: 12, length2: 8, smooth: true },
      emphasis: { label: { show: !small, fontSize: 13, fontWeight: 500 } },
      data: sorted.map((d, i) => ({
        name: d.categoryName,
        value: Math.round(d.revenue),
        itemStyle: { color: colorForIndex(i, sorted.length) }
      }))
    }]
  };
};

//this is for the donutOption changes for small screens:
const isLg = ref(window.matchMedia('(min-width: 1024px)').matches);
const mq = window.matchMedia('(min-width: 1024px)');
const handler = (e: MediaQueryListEvent) => isLg.value = e.matches;
mq.addEventListener('change', handler);
onUnmounted(() => mq.removeEventListener('change', handler));

async function load() {
  loading.value = true;
  error.value = null;
  try {
    data.value = await getCategorySales(startDate.value, endDate.value);
  } catch (e) {
    error.value = 'Sorry, an error has occurred.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="pageStyle">
    <div class="pageHeader">
      <h1>Sales by category</h1>
      <div class="date-row">
        <input type="date" v-model="startDate" class="date" />
        <span class="text-[13px] text-gray-500">to</span>
        <input type="date" v-model="endDate" class="date" />
        <button class="buttonPrimary" @click="load" :disabled="loading">
          {{ loading ? 'Loading...' : 'Apply' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center mt-30  min-h-screen">
      <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
      <p class="text-lg text-gray-600 font-light">Loading ...</p>
    </div>
    <div v-if="error" class="text-[14px] mb-4 text-red-600">{{ error }}</div>

    <div class="card mb-4" v-if="data.length">
      <div class="cardTitle">Revenue by category</div>
      <VChart :option="chartOption" :style="{ height: data.length * 56 + 40 + 'px' }" autoresize />
    </div>

    <!-- Donut chart -->
    <div class="card mb-4" v-if="data.length">
      <div class="cardTitle">Revenue share by category</div>
      <VChart :option="donutOption(!isLg)" :style="{ height: isLg ? '400px' : '480px' }" autoresize />
    </div>

    <!-- Summary table -->
    <div class="tableCard" v-if="data.length">
      <table class="w-full border-collapse text-[13px]">
        <thead>
          <tr class="border-b border-gray-200 text-[11px] font-medium uppercase tracking-[0.04em] ">
            <th class="text-left px-4 py-3">Category
            </th>
            <th class="text-right px-4 py-3">Revenue
            </th>
            <th class="text-right px-4 py-3">Share
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
          <tr v-for="item in processedCategories" :key="item.categoryName" class="hover:bg-gray-50">
            <td class="align-middle px-4 py-2.5">
              <span class="hidden xs:inline-block h-2.5 w-2.5 rounded-full mr-2 align-middle"
                :style="{ background: item.dotColor }"></span>
              {{ item.categoryName }}
            </td>
            <td class="text-right align-middle px-4 py-2.5">{{ item.formattedRevenue }}</td>
            <td class="text-right align-middle text-gray-500 px-4 py-2.5">{{ item.share }}</td>
          </tr>
        </tbody>
      </table>

    </div>

  </div>
</template>

<style scoped></style>