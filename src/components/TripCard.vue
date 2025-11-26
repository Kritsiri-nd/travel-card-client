<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Galleria from "primevue/galleria";
import type { Trip } from "../types/trip";

const props = defineProps<{
  trip: Trip;
  dateLabel: string;
  excerpt: string;
  mapLabel?: string;
}>();

const emit = defineEmits<{
  (e: "tag-click", value: string): void;
}>();

const fallbackPhoto = "https://via.placeholder.com/800x600?text=No+Image";

const photos = computed(() =>
  props.trip.photos?.length ? props.trip.photos : [fallbackPhoto]
);

const galleryItems = computed(() =>
  photos.value.map((url, index) => ({
    itemImageSrc: url,
    thumbnailImageSrc: url,
    alt: `${props.trip.title ?? "Trip photo"} ${index + 1}`,
    index, // Add index here
  }))
);

const activeIndex = ref(0);
const fullScreenVisible = ref(false);

watch(
  photos,
  () => {
    activeIndex.value = 0;
  },
  { immediate: true }
);

const openFullScreen = (index: number) => {
  activeIndex.value = index;
  fullScreenVisible.value = true;
};

const getMapLink = (lat?: number, long?: number) => {
  if (lat == null || long == null) return "#";
  return `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
};

const galleriaPT = {
  root: {
    class:
      "inline-galleria bg-white rounded-[2rem] overflow-hidden shadow-lg !border-0",
  },
  content: { class: "bg-transparent" },
  itemWrapper: { class: "rounded-[2rem] overflow-hidden" },
};
</script>

<template>
  <article
    class="group bg-white rounded-3xl overflow-hidden flex flex-col gap-4 py-4 px-4"
  >
    <Galleria
      v-model:activeIndex="activeIndex"
      :value="galleryItems"
      :circular="true"
      :showItemNavigators="true"
      :showThumbnailNavigators="false"
      :showThumbnails="false"
      :pt="galleriaPT"
    >
      <template #item="slotProps">
        <div
          class="relative bg-slate-900/10 h-[400px] w-[400px] cursor-pointer"
          @click="openFullScreen(slotProps.item.index)"
        >
          <img
            :src="slotProps.item.itemImageSrc"
            :alt="slotProps.item.alt"
            class="w-full h-full object-cover rounded-none"
          />
          <div class="absolute top-4 left-4 flex flex-wrap gap-2">
            <button
              v-for="tag in trip.tags?.slice(0, 3)"
              :key="tag"
              type="button"
              class="tag-chip focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              @click.stop="emit('tag-click', tag)"
            >
              <span class="tag-dot"></span>
              {{ tag }}
            </button>
          </div>
        </div>
      </template>
    </Galleria>

    <div class="thumb-row">
      <button
        v-for="(photo, index) in photos"
        :key="photo + index"
        type="button"
        class="preview-thumb"
        :class="{ 'preview-thumb-active': activeIndex === index }"
        @click="activeIndex = index"
      >
        <img :src="photo" alt="thumbnail" class="w-full h-full object-cover" />
      </button>
    </div>

    <div class="px-1 flex flex-col flex-1">
      <div class="mb-3 flex items-center justify-between">
        <span
          class="text-xs font-medium text-slate-400 uppercase tracking-wider"
        >
          {{ dateLabel }}
        </span>
      </div>

      <router-link :to="{ name: 'trip-details', params: { id: trip.id } }">
        <h2
          class="text-2xl font-semibold text-slate-900 mb-3 leading-snug group-hover:text-cyan-600 transition-colors duration-300"
        >
          {{ trip.title || "Untitled Trip" }}
        </h2>
      </router-link>

      <p class="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
        {{ excerpt }}
      </p>

      <div
        class="mt-auto flex items-center justify-between pt-4 border-t border-slate-100"
      >
        <a
          :href="getMapLink(trip.latitude, trip.longitude)"
          target="_blank"
          class="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-500 transition-colors duration-300 py-1 px-2 rounded-lg hover:bg-cyan-50"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
          {{ mapLabel ?? "Location" }}
        </a>

        <router-link
          :to="{ name: 'trip-details', params: { id: trip.id } }"
          class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-sm"
        >
          <svg
            class="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </router-link>
      </div>
    </div>

    <Galleria
      v-model:visible="fullScreenVisible"
      v-model:activeIndex="activeIndex"
      :value="galleryItems"
      :circular="true"
      :fullScreen="true"
      :showThumbnails="false"
      :showItemNavigators="true"
      :showIndicators="true"
      :autoPlay="false"
    >
      <template #item="slotProps">
        <img
          :src="slotProps.item.itemImageSrc"
          :alt="slotProps.item.alt"
          class="max-w-[1000px] max-h-[800px] object-contain"
        />
      </template>
    </Galleria>
  </article>
</template>

<style scoped>
.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.9rem;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 9999px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: linear-gradient(
    120deg,
    rgba(59, 130, 246, 0.55),
    rgba(14, 165, 233, 0.4)
  );
  box-shadow: 0 8px 20px rgba(15, 118, 110, 0.2);
  backdrop-filter: blur(10px);
  animation: chipGlow 5s ease-in-out infinite;
  transform-origin: center;
  cursor: pointer;
  appearance: none;
}

.tag-chip:hover {
  transform: translateY(-1px) scale(1.03);
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  animation: tagPulse 2.5s ease-in-out infinite;
}

.inline-galleria :global(.p-galleria-content) {
  border: none;
}

.thumb-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.5rem 0 1.25rem;
  justify-content: center;
}

.preview-thumb {
  width: 80px;
  height: 60px;
  border-radius: 0.9rem;
  border: 2px solid transparent;
  overflow: hidden;
  filter: grayscale(100%) opacity(0.6);
  transition: transform 0.2s ease, filter 0.2s ease, border 0.2s ease;
  background: #fff;
}

.preview-thumb:hover {
  transform: translateY(-2px);
}

.preview-thumb-active {
  filter: none;
  border-color: #0ea5e9;
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.25);
}

.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inline-galleria :global(.p-galleria-item-prev),
.inline-galleria :global(.p-galleria-item-next) {
  background: rgba(15, 23, 42, 0.35);
  border-radius: 9999px;
  width: 40px;
  height: 40px;
}
.inline-galleria :global(.p-galleria-item-prev:hover),
.inline-galleria :global(.p-galleria-item-next:hover) {
  background: rgba(14, 165, 233, 0.7);
}
.inline-galleria :global(.p-galleria-thumbnail-container) {
  display: none;
}
</style>
