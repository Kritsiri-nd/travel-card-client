<script setup lang="ts">
defineProps<{
  currentPage: number;
  totalPages: number;
  displayedPages: (number | string)[];
}>();

defineEmits<{
  (e: "changePage", page: number | string): void;
}>();
</script>

<template>
  <div
    class="p-4 border-t border-gray-100 flex justify-center items-center gap-2"
  >
    <button
      @click="$emit('changePage', currentPage - 1)"
      :disabled="currentPage === 1"
      class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <template v-for="(page, index) in displayedPages" :key="index">
      <button
        v-if="page === '...'"
        class="w-8 h-8 flex items-center justify-center text-gray-500 cursor-default"
      >
        ...
      </button>
      <button
        v-else
        @click="$emit('changePage', page)"
        :class="[
          'w-8 h-8 flex items-center justify-center rounded-full font-bold transition-all',
          currentPage === page
            ? 'bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow-lg scale-110'
            : 'text-gray-600 hover:bg-gray-100',
        ]"
      >
        {{ page }}
      </button>
    </template>

    <button
      @click="$emit('changePage', currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>
