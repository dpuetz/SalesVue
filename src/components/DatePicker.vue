<script setup>

import { ref, computed } from 'vue';

// Component Statez
const startDate = ref('');
const endDate = ref('');

// Compute minimum allowable end date based on start date selection
const minEndDate = computed(() => startDate.value || '');

// Watcher to clear invalid end dates if start date shifts forward
const handleStartDateChange = () => {
  if (endDate.value && endDate.value < startDate.value) {
    endDate.value = '';
  }
};
</script>

<template>
  <div
    class="flex flex-col sm:flex-row items-center gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 max-w-xl mx-auto">

    <!-- Start Date Input -->
    <div class="w-full flex flex-col gap-1.5">
      <label for="start-date" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Check-In
      </label>
      <div class="relative">
        <input id="start-date" type="date" v-model="startDate" @change="handleStartDateChange"
          class="w-full px-4 py-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer" />
      </div>
    </div>

    <!-- Divider Arrow -->
    <div class="hidden sm:block text-slate-400 mt-5 shrink-0">
      <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </div>

    <!-- End Date Input -->
    <div class="w-full flex flex-col gap-1.5">
      <label for="end-date" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Check-Out
      </label>
      <input id="end-date" type="date" v-model="endDate" :min="minEndDate" :disabled="!startDate"
        class="w-full px-4 py-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900" />
    </div>

  </div>
</template>
