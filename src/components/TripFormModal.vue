<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";
import type { Trip } from "../types/trip";

const props = defineProps<{
  isOpen: boolean;
  mode: "create" | "edit";
  initialData: Partial<Trip>;
  loading: boolean;
  uploading: boolean;
  googleMapsApiKey: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", data: any): void;
  (e: "upload-image", event: Event): void;
  (e: "remove-image", index: number): void;
}>();

const form = ref({
  title: "",
  description: "",
  photos: [] as string[],
  tags: "",
  latitude: "",
  longitude: "",
});

const errors = ref<{ description?: string; photos?: string }>({});

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      errors.value = {}; // Clear errors on open
      if (props.mode === "edit" && props.initialData) {
        form.value = {
          title: props.initialData.title || "",
          description: props.initialData.description || "",
          photos: [...(props.initialData.photos || [])],
          tags: props.initialData.tags?.join(", ") || "",
          latitude: props.initialData.latitude?.toString() || "",
          longitude: props.initialData.longitude?.toString() || "",
        };
      } else {
        form.value = {
          title: "",
          description: "",
          photos: [],
          tags: "",
          latitude: "",
          longitude: "",
        };
      }
    }
  }
);

watch(
  () => props.initialData.photos,
  (newPhotos) => {
    if (props.isOpen && newPhotos) {
      form.value.photos = [...newPhotos];
    }
  },
  { deep: true }
);

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

const handleMapClick = (event: any) => {
  form.value.latitude = event.latLng.lat().toFixed(6);
  form.value.longitude = event.latLng.lng().toFixed(6);
};

const validate = () => {
  errors.value = {};
  let isValid = true;

  if (!form.value.description?.trim()) {
    errors.value.description = "Description is required.";
    isValid = false;
  }

  if (form.value.photos.length === 0) {
    errors.value.photos = "At least 1 image is required.";
    isValid = false;
  } else if (form.value.photos.length > 3) {
    errors.value.photos = "Maximum 3 images allowed.";
    isValid = false;
  }

  return isValid;
};

const handleSubmit = () => {
  if (validate()) {
    emit("save", form.value);
  }
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-pop"
    >
      <div
        class="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10"
      >
        <h3 class="text-xl font-bold text-gray-900">
          {{ mode === "create" ? "New Trip" : "Edit Trip" }}
        </h3>
        <button
          @click="$emit('close')"
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

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
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
            :class="{ 'border-red-300 focus:ring-red-500': errors.description }"
          ></textarea>
          <p v-if="errors.description" class="text-xs text-red-500 mt-1">
            {{ errors.description }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Images ({{ form.photos.length }}/3)</label
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
                @click="$emit('remove-image', index)"
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
              v-if="form.photos.length < 3"
              class="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="$emit('upload-image', $event)"
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
          <p v-if="errors.photos" class="text-xs text-red-500 mt-1">
            {{ errors.photos }}
          </p>
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
            :api-key="googleMapsApiKey"
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

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || uploading"
            class="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-70"
          >
            {{ loading ? "Saving..." : "Save" }}
          </button>
        </div>
      </form>
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
