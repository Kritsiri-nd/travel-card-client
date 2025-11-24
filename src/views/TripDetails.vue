<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import type { Trip } from "../types/trip";

const route = useRoute();
const tripId = route.params.id;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const trip = ref<Trip | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchTrip = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`);
    if (!response.ok) {
      throw new Error(`Failed to load trip: ${response.statusText}`);
    }
    const data = await response.json();
    trip.value = data;
  } catch (err) {
    console.error("Fetch Error:", err);
    error.value =
      err instanceof Error ? err.message : "Failed to load trip details";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTrip);

const formatDate = (value?: string) => {
  if (!value) return "Unknown Date";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getMapLink = (lat?: number, long?: number) => {
  if (lat == null || long == null) return "#";
  return `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar removed (already in App.vue) -->

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"
        ></div>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <h2 class="text-2xl font-bold text-red-600 mb-2">Error Loading Trip</h2>
        <p class="text-gray-600">{{ error }}</p>
        <button
          @click="fetchTrip"
          class="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          Retry
        </button>
      </div>

      <div v-else-if="trip">
        <!-- Hero Section -->
        <div class="relative h-96 rounded-2xl overflow-hidden shadow-xl mb-8">
          <img
            :src="
              trip.photos?.[0] ||
              'https://via.placeholder.com/1200x600?text=No+Image'
            "
            :alt="trip.title"
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8"
          >
            <h1 class="text-4xl font-bold text-white mb-2">{{ trip.title }}</h1>
            <div class="flex items-center text-white/90 space-x-4">
              <span class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {{ formatDate(trip.createdAt || trip.updatedAt) }}
              </span>
              <span
                class="flex items-center"
                v-if="trip.latitude && trip.longitude"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Location
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-2xl p-8 shadow-sm">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">
                About this trip
              </h2>
              <p
                class="text-gray-600 leading-relaxed text-lg whitespace-pre-line"
              >
                {{ trip.description }}
              </p>

              <div class="mt-6 flex flex-wrap gap-2">
                <span
                  v-for="tag in trip.tags"
                  :key="tag"
                  class="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>

            <!-- Gallery -->
            <div
              class="bg-white rounded-2xl p-8 shadow-sm"
              v-if="trip.photos && trip.photos.length > 0"
            >
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  v-for="(photo, index) in trip.photos"
                  :key="index"
                  class="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img :src="photo" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar / Map -->
          <div class="space-y-8">
            <!-- Author Card -->
            <!-- Author Card -->
            <div class="bg-white rounded-2xl p-6 shadow-sm" v-if="trip.author">
              <h2 class="text-xl font-bold text-gray-900 mb-4">ผู้เขียน</h2>
              <div class="flex flex-col items-center text-center">
                <div
                  class="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-cyan-100 shadow-sm"
                >
                  <img
                    :src="
                      trip.author.avatarUrl ||
                      'https://ui-avatars.com/api/?name=' + trip.author.name
                    "
                    :alt="trip.author.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <h3 class="text-lg font-bold text-gray-900">
                  {{ trip.author.name }}
                </h3>
                <p
                  class="text-gray-500 text-sm leading-relaxed mt-2"
                  v-if="trip.author.bio"
                >
                  {{ trip.author.bio }}
                </p>
                <p class="text-gray-400 text-sm italic mt-2" v-else>
                  No bio available
                </p>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Location</h2>
              <div
                class="aspect-square w-full rounded-xl overflow-hidden bg-gray-100 relative"
              >
                <iframe
                  v-if="trip.latitude && trip.longitude"
                  width="100%"
                  height="100%"
                  style="border: 0"
                  loading="lazy"
                  allowfullscreen
                  :src="`https://maps.google.com/maps?q=${trip.latitude},${trip.longitude}&z=15&output=embed`"
                >
                </iframe>
                <div
                  v-else
                  class="absolute inset-0 flex items-center justify-center text-gray-400"
                >
                  No location data
                </div>
              </div>
              <div class="mt-6">
                <a
                  :href="getMapLink(trip.latitude, trip.longitude)"
                  target="_blank"
                  class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
