<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: "red" | "cyan";
    loading: boolean;
    iconType?: "delete" | "edit";
  }>(),
  {
    confirmText: "Confirm",
    confirmColor: "red",
    iconType: "delete",
  }
);

defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();

const iconColorClass = computed(() => {
  return props.confirmColor === "red"
    ? "bg-red-100 text-red-500"
    : "bg-cyan-100 text-cyan-500";
});

const buttonColorClass = computed(() => {
  return props.confirmColor === "red"
    ? "bg-red-500 hover:bg-red-600"
    : "bg-cyan-500 hover:bg-cyan-600";
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-pop"
    >
      <div
        class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
        :class="iconColorClass"
      >
        <svg
          v-if="iconType === 'delete'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-gray-500 mb-6">
        {{ message }}
      </p>
      <div class="flex justify-center gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm')"
          :disabled="loading"
          class="px-4 py-2 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-70"
          :class="buttonColorClass"
        >
          {{ loading ? "Processing..." : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pop {
  animation: pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes pop {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
