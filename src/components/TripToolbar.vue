<script setup lang="ts">
defineProps<{
  searchQuery: string;
}>();

defineEmits<{
  (e: "update:searchQuery", value: string): void;
  (e: "create"): void;
}>();
</script>

<template>
  <div
    class="bg-white rounded-t-xl p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 shadow-sm"
  >
    <div
      class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start"
    >
      <span class="text-gray-600 font-semibold sm:hidden">Add trip</span>
      <button
        @click="$emit('create')"
        class="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        New
      </button>
    </div>

    <div class="relative w-full sm:w-64">
      <input
        :value="searchQuery"
        @input="
          $emit('update:searchQuery', ($event.target as HTMLInputElement).value)
        "
        type="text"
        placeholder="Search..."
        class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  </div>
</template>
