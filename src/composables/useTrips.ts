import { ref, computed, watch, onMounted } from "vue";
import type { Trip } from "../types/trip";
import useAuth from "./useAuth";

export default function useTrips() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
  const { token } = useAuth();

  const trips = ref<Trip[]>([]);
  const loading = ref(true);
  const searchQuery = ref("");
  const currentPage = ref(1);
  const itemsPerPage = 8;

  const fetchMyTrips = async () => {
    loading.value = true;
    try {
      const response = await fetch(`${API_BASE_URL}/trips/mine`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      if (response.ok) {
        trips.value = await response.json();
      }
    } catch (error) {
      console.error("Failed to fetch trips", error);
    } finally {
      loading.value = false;
    }
  };

  const filteredTrips = computed(() => {
    if (!searchQuery.value) return trips.value;
    const query = searchQuery.value.toLowerCase();
    return trips.value.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
  });

  const totalPages = computed(() =>
    Math.ceil(filteredTrips.value.length / itemsPerPage)
  );

  const paginatedTrips = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredTrips.value.slice(start, end);
  });

  const displayedPages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  });

  const changePage = (page: number | string) => {
    if (typeof page === "number" && page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  watch(totalPages, (newTotal) => {
    if (currentPage.value > newTotal) {
      currentPage.value = Math.max(1, newTotal);
    }
  });

  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  onMounted(fetchMyTrips);

  return {
    trips,
    loading,
    searchQuery,
    currentPage,
    itemsPerPage,
    filteredTrips,
    totalPages,
    paginatedTrips,
    displayedPages,
    fetchMyTrips,
    changePage,
  };
}
