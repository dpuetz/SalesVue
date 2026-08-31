import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardFiltersStore = defineStore('dashboardFilters', () => {
  const orderDateRange = ref<string[] | null>(null);

  function save(filters: { orderDateRange: string[] | null }) {
    orderDateRange.value = filters.orderDateRange;
  }

  function clear() {
    orderDateRange.value = null;
  }

  return { orderDateRange, save, clear };
});
