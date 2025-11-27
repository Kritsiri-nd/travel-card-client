<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import SearchHero from "../components/SearchHero.vue";
import TripCard from "../components/TripCard.vue";
import TripSkeletonGrid from "../components/TripSkeletonGrid.vue";
import ErrorState from "../components/ErrorState.vue";
import EmptyState from "../components/EmptyState.vue";
import type { Trip } from "../types/trip";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const trips = ref<Trip[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref("");
const visibleCount = ref(6);

const filteredTrips = computed(() => {
  if (!searchQuery.value) return trips.value;
  const query = searchQuery.value.toLowerCase();
  return trips.value.filter((trip) => {
    const matchTitle = trip.title?.toLowerCase().includes(query) || false;
    const matchDesc = trip.description?.toLowerCase().includes(query) || false;
    const matchTags =
      trip.tags?.some((tag) => tag.toLowerCase().includes(query)) || false;
    return matchTitle || matchDesc || matchTags;
  });
});

const displayedTrips = computed(() => {
  return filteredTrips.value.slice(0, visibleCount.value);
});

const hasMore = computed(() => {
  return filteredTrips.value.length > visibleCount.value;
});

const emptyMessage = computed(
  () => `No trips found matching "${searchQuery.value}"`
);

const loadMore = () => {
  visibleCount.value += 6;
};

const fetchTrips = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${API_BASE_URL}/trips`);
    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();
    trips.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Fetch Error:", err);
    error.value = err instanceof Error ? err.message : "Failed to load trips";
  } finally {
    loading.value = false;
  }
};

const truncate = (text: string, limit = 100) => {
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

const formatDate = (value?: string) => {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

onMounted(fetchTrips);
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-cyan-200 selection:text-cyan-900"
  >
    <section class="px-6 py-12 max-w-6xl mx-auto space-y-12">
      <SearchHero v-model="searchQuery" />

      <div>
        <TripSkeletonGrid v-if="loading" />

        <ErrorState v-else-if="error" :message="error" @retry="fetchTrips" />

        <EmptyState v-else-if="!filteredTrips.length" :message="emptyMessage" />

        <template v-else>
          <TransitionGroup
            tag="div"
            name="list"
            class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 relative"
          >
            <TripCard
              v-for="trip in displayedTrips"
              :key="trip.id"
              :trip="trip"
              :date-label="formatDate(trip.createdAt || trip.updatedAt)"
              :excerpt="truncate(trip.description)"
              @tag-click="(value) => (searchQuery = value)"
            />
          </TransitionGroup>

          <!-- Load More Button -->
          <div v-if="hasMore && !loading" class="flex justify-center mt-12">
            <button
              @click="loadMore"
              class="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-out"
            >
              Load More
            </button>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slideDown 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes gradientX {
  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradientX 3s ease infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(30px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
  z-index: -1;
}
</style>
