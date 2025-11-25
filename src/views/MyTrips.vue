<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import useAuth from "../composables/useAuth";
import type { Trip } from "../types/trip";
import TripToolbar from "../components/TripToolbar.vue";
import TripTable from "../components/TripTable.vue";
import TripPagination from "../components/TripPagination.vue";
import TripFormModal from "../components/TripFormModal.vue";
import ConfirmationModal from "../components/ConfirmationModal.vue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const { token } = useAuth();

const trips = ref<Trip[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const isModalOpen = ref(false);
const isConfirmationModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const currentTrip = ref<Partial<Trip>>({});
const tripToDelete = ref<Trip | null>(null);
const pendingTripData = ref<any>(null);
const confirmationConfig = ref({
  title: "",
  message: "",
  confirmText: "",
  confirmColor: "red" as "red" | "cyan",
  iconType: "delete" as "delete" | "edit",
  action: "delete" as "delete" | "edit",
});
const submitting = ref(false);
const uploading = ref(false);

// Pagination
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

onMounted(fetchMyTrips);

const filteredTrips = computed(() => {
  if (!searchQuery.value) return trips.value;
  const query = searchQuery.value.toLowerCase();
  return trips.value.filter(
    (t) =>
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
  );
});

// Pagination Logic
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

const openCreateModal = () => {
  modalMode.value = "create";
  currentTrip.value = {};
  isModalOpen.value = true;
};

const openEditModal = (trip: Trip) => {
  modalMode.value = "edit";
  currentTrip.value = trip;
  isModalOpen.value = true;
};

const openDeleteModal = (trip: Trip) => {
  tripToDelete.value = trip;
  confirmationConfig.value = {
    title: "Delete Trip?",
    message: `Are you sure you want to delete "${trip.title}"? This action cannot be undone.`,
    confirmText: "Delete",
    confirmColor: "red",
    iconType: "delete",
    action: "delete",
  };
  isConfirmationModalOpen.value = true;
};

const uploadImage = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  uploading.value = true;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data?.url) {
      if (!currentTrip.value.photos) {
        currentTrip.value.photos = [];
      }
      currentTrip.value.photos.push(data.url);
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Error uploading image");
  } finally {
    uploading.value = false;
    input.value = ""; // Reset input
  }
};

const removeImage = (index: number) => {
  if (currentTrip.value.photos) {
    currentTrip.value.photos.splice(index, 1);
  }
};

const saveTrip = async (formData: any) => {
  pendingTripData.value = formData;
  if (modalMode.value === "create") {
    confirmationConfig.value = {
      title: "Create Trip?",
      message: "Are you sure you want to create this trip?",
      confirmText: "Create",
      confirmColor: "cyan",
      iconType: "edit",
      action: "create" as any, // casting to any to avoid type error if action type isn't updated yet
    };
  } else {
    confirmationConfig.value = {
      title: "Update Trip?",
      message: `Are you sure you want to update "${formData.title}"?`,
      confirmText: "Update",
      confirmColor: "cyan",
      iconType: "edit",
      action: "edit",
    };
  }
  isConfirmationModalOpen.value = true;
};

const executeSaveTrip = async (formData: any) => {
  submitting.value = true;
  try {
    const payload = {
      title: formData.title,
      description: formData.description,
      photos: formData.photos,
      tags: formData.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter((t: string) => t),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };

    const url =
      modalMode.value === "create"
        ? `${API_BASE_URL}/trips`
        : `${API_BASE_URL}/trips/${currentTrip.value.id}`;

    const method = modalMode.value === "create" ? "POST" : "PUT";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to save trip");

    await fetchMyTrips();
    isModalOpen.value = false;
    isConfirmationModalOpen.value = false;
  } catch (error) {
    console.error("Error saving trip:", error);
    alert("Failed to save trip. Please try again.");
  } finally {
    submitting.value = false;
    pendingTripData.value = null;
  }
};

const handleConfirmation = async () => {
  if (confirmationConfig.value.action === "delete") {
    await deleteTrip();
  } else {
    // Handles both create and edit
    await executeSaveTrip(pendingTripData.value);
  }
};

const deleteTrip = async () => {
  if (!tripToDelete.value) return;
  submitting.value = true;
  try {
    const response = await fetch(
      `${API_BASE_URL}/trips/${tripToDelete.value.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to delete trip");

    await fetchMyTrips();
    isConfirmationModalOpen.value = false;
  } catch (error) {
    console.error("Error deleting trip:", error);
    alert("Failed to delete trip.");
  } finally {
    submitting.value = false;
    tripToDelete.value = null;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <TripToolbar
        v-model:searchQuery="searchQuery"
        @create="openCreateModal"
      />

      <TripTable
        :trips="paginatedTrips"
        :loading="loading"
        @edit="openEditModal"
        @delete="openDeleteModal"
      >
        <template #pagination>
          <TripPagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :displayed-pages="displayedPages"
            @change-page="changePage"
          />
        </template>
      </TripTable>
    </div>

    <TripFormModal
      :is-open="isModalOpen"
      :mode="modalMode"
      :initial-data="currentTrip"
      :loading="submitting"
      :uploading="uploading"
      :google-maps-api-key="GOOGLE_MAPS_API_KEY"
      @close="isModalOpen = false"
      @save="saveTrip"
      @upload-image="uploadImage"
      @remove-image="removeImage"
    />

    <ConfirmationModal
      :is-open="isConfirmationModalOpen"
      :title="confirmationConfig.title"
      :message="confirmationConfig.message"
      :confirm-text="confirmationConfig.confirmText"
      :confirm-color="confirmationConfig.confirmColor"
      :icon-type="confirmationConfig.iconType"
      :loading="submitting"
      @close="isConfirmationModalOpen = false"
      @confirm="handleConfirmation"
    />
  </div>
</template>
