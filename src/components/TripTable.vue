<script setup lang="ts">
import type { Trip } from "../types/trip";

defineProps<{
  trips: Trip[];
  loading: boolean;
}>();

defineEmits<{
  (e: "edit", trip: Trip): void;
  (e: "delete", trip: Trip): void;
}>();
</script>

<template>
  <div class="bg-white rounded-b-xl shadow-sm overflow-hidden">
    <!-- Desktop Table View -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <th class="p-4 font-semibold border-b border-gray-100">Image</th>
            <th class="p-4 font-semibold border-b border-gray-100">Title</th>
            <th class="p-4 font-semibold border-b border-gray-100">
              Description
            </th>
            <th class="p-4 font-semibold border-b border-gray-100">Date</th>
            <th class="p-4 font-semibold border-b border-gray-100 text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading">
            <td colspan="5" class="p-8 text-center text-gray-500">
              Loading trips...
            </td>
          </tr>
          <tr v-else-if="trips.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-500">
              No trips found.
            </td>
          </tr>
          <tr
            v-for="trip in trips"
            :key="trip.id"
            class="hover:bg-gray-50 transition-colors group"
          >
            <td class="p-4 w-24">
              <div
                class="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
              >
                <img
                  :src="
                    trip.photos?.[0] ||
                    'https://via.placeholder.com/150?text=No+Img'
                  "
                  class="w-full h-full object-cover"
                  alt="Trip cover"
                />
              </div>
            </td>
            <td class="p-4 font-medium text-gray-900">{{ trip.title }}</td>
            <td class="p-4 text-gray-500 max-w-xs truncate">
              {{ trip.description }}
            </td>
            <td class="p-4 text-gray-500 text-sm">
              {{ new Date(trip.createdAt || "").toLocaleDateString() }}
            </td>
            <td class="p-4">
              <div class="flex justify-center gap-2">
                <button
                  @click="$emit('edit', trip)"
                  class="p-2 text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors"
                  title="Edit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
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
                </button>
                <button
                  @click="$emit('delete', trip)"
                  class="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        Loading trips...
      </div>
      <div v-else-if="trips.length === 0" class="p-8 text-center text-gray-500">
        No trips found.
      </div>
      <div v-else class="divide-y divide-gray-100">
        <div v-for="trip in trips" :key="trip.id" class="p-4">
          <div class="flex gap-4">
            <div
              class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
            >
              <img
                :src="
                  trip.photos?.[0] ||
                  'https://via.placeholder.com/150?text=No+Img'
                "
                class="w-full h-full object-cover"
                alt="Trip cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <h3 class="font-medium text-gray-900 truncate pr-2">
                  {{ trip.title }}
                </h3>
                <div class="flex gap-1">
                  <button
                    @click="$emit('edit', trip)"
                    class="p-1 text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
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
                  </button>
                  <button
                    @click="$emit('delete', trip)"
                    class="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                {{ trip.description }}
              </p>
              <p class="text-xs text-gray-400 mt-2">
                {{ new Date(trip.createdAt || "").toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <slot name="pagination"></slot>
  </div>
</template>
