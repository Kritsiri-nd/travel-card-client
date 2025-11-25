<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import useAuth from "../composables/useAuth";
import type { Trip } from "../types/trip";
import { supabase } from "../lib/supabase";
import { GoogleMap, Marker } from "vue3-google-map";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const { token } = useAuth();

const trips = ref<Trip[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const currentTrip = ref<Partial<Trip>>({});
const tripToDelete = ref<Trip | null>(null);
const submitting = ref(false);
const uploading = ref(false);

// Form fields
const form = ref({
  title: "",
  description: "",
  photos: [] as string[],
  tags: "",
  latitude: "",
  longitude: "",
});

const mapCenter = computed(() => {
  const lat = parseFloat(form.value.latitude) || 13.7563;
  const lng = parseFloat(form.value.longitude) || 100.5018;
  return { lat, lng };
});

const mapMarker = computed(() => {
  if (form.value.latitude && form.value.longitude) {
    return {
      lat: parseFloat(form.value.latitude),
      lng: parseFloat(form.value.longitude),
    };
  }
  return null;
});

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

const openCreateModal = () => {
  modalMode.value = "create";
  form.value = {
    title: "",
    description: "",
    photos: [],
    tags: "",
    latitude: "",
    longitude: "",
  };
  isModalOpen.value = true;
};

const openEditModal = (trip: Trip) => {
  modalMode.value = "edit";
  currentTrip.value = trip;
  form.value = {
    title: trip.title,
    description: trip.description,
    photos: [...(trip.photos || [])],
    tags: trip.tags?.join(", ") || "",
    latitude: trip.latitude?.toString() || "",
    longitude: trip.longitude?.toString() || "",
  };
  isModalOpen.value = true;
};

const openDeleteModal = (trip: Trip) => {
  tripToDelete.value = trip;
  isDeleteModalOpen.value = true;
};

const handleMapClick = (event: any) => {
  form.value.latitude = event.latLng.lat().toFixed(6);
  form.value.longitude = event.latLng.lng().toFixed(6);
};

const uploadImage = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  uploading.value = true;
  const file = input.files?.[0];
  if (!file) return;
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from("trips")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("trips").getPublicUrl(filePath);
    form.value.photos.push(data.publicUrl);
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Error uploading image");
  } finally {
    uploading.value = false;
    input.value = ""; // Reset input
  }
};

const removeImage = (index: number) => {
  form.value.photos.splice(index, 1);
};

const saveTrip = async () => {
  submitting.value = true;
  try {
    const payload = {
      title: form.value.title,
      description: form.value.description,
      photos: form.value.photos,
      tags: form.value.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      latitude: form.value.latitude ? parseFloat(form.value.latitude) : null,
      longitude: form.value.longitude ? parseFloat(form.value.longitude) : null,
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
  } catch (error) {
    console.error("Error saving trip:", error);
    alert("Failed to save trip. Please try again.");
  } finally {
    submitting.value = false;
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
    isDeleteModalOpen.value = false;
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
      <!-- Toolbar -->
      <div
        class="bg-white rounded-t-xl p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm"
      >
        <div class="flex items-center gap-2">
          <button
            @click="openCreateModal"
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
            v-model="searchQuery"
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

      <!-- Table -->
      <div class="bg-white rounded-b-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider"
              >
                <th class="p-4 font-semibold border-b border-gray-100">
                  Image
                </th>
                <th class="p-4 font-semibold border-b border-gray-100">
                  Title
                </th>
                <th class="p-4 font-semibold border-b border-gray-100">
                  Description
                </th>
                <th class="p-4 font-semibold border-b border-gray-100">Date</th>
                <th
                  class="p-4 font-semibold border-b border-gray-100 text-center"
                >
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
              <tr v-else-if="filteredTrips.length === 0">
                <td colspan="5" class="p-8 text-center text-gray-500">
                  No trips found.
                </td>
              </tr>
              <tr
                v-for="trip in filteredTrips"
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
                      @click="openEditModal(trip)"
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
                      @click="openDeleteModal(trip)"
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
        <!-- Pagination (Mock) -->
        <div
          class="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500"
        >
          <span>Showing {{ filteredTrips.length }} entries</span>
          <div class="flex gap-2">
            <button
              class="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button
              class="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-pop"
      >
        <div
          class="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10"
        >
          <h3 class="text-xl font-bold text-gray-900">
            {{ modalMode === "create" ? "New Trip" : "Edit Trip" }}
          </h3>
          <button
            @click="isModalOpen = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveTrip" class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Name</label
            >
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Description</label
            >
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Images</label
            >
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
              <div
                v-for="(photo, index) in form.photos"
                :key="index"
                class="relative aspect-square rounded-lg overflow-hidden group border border-gray-200"
              >
                <img
                  :src="photo"
                  class="w-full h-full object-cover"
                  alt="Trip photo"
                />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <label
                class="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="uploadImage"
                  :disabled="uploading"
                />
                <svg
                  v-if="!uploading"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span v-else class="text-xs text-gray-500">Uploading...</span>
              </label>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Latitude</label
              >
              <input
                v-model="form.latitude"
                type="number"
                step="any"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Longitude</label
              >
              <input
                v-model="form.longitude"
                type="number"
                step="any"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>
          </div>

          <div
            class="h-64 w-full rounded-lg overflow-hidden border border-gray-300"
          >
            <GoogleMap
              :api-key="GOOGLE_MAPS_API_KEY"
              style="width: 100%; height: 100%"
              :center="mapCenter"
              :zoom="12"
              @click="handleMapClick"
            >
              <Marker v-if="mapMarker" :options="{ position: mapMarker }" />
            </GoogleMap>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Tags (comma separated)</label
            >
            <input
              v-model="form.tags"
              type="text"
              placeholder="Nature, Beach, Food"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div
            class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100"
          >
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting || uploading"
              class="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-70"
            >
              {{ submitting ? "Saving..." : "Save" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-pop"
      >
        <div
          class="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4"
        >
          <svg
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
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Delete Trip?</h3>
        <p class="text-gray-500 mb-6">
          Are you sure you want to delete "{{ tripToDelete?.title }}"? This
          action cannot be undone.
        </p>
        <div class="flex justify-center gap-3">
          <button
            @click="isDeleteModalOpen = false"
            class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="deleteTrip"
            :disabled="submitting"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-70"
          >
            {{ submitting ? "Deleting..." : "Delete" }}
          </button>
        </div>
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
