<script setup lang="ts">
import TripToolbar from "../components/TripToolbar.vue";
import TripTable from "../components/TripTable.vue";
import TripPagination from "../components/TripPagination.vue";
import TripFormModal from "../components/TripFormModal.vue";
import ConfirmationModal from "../components/ConfirmationModal.vue";
import useTrips from "../composables/useTrips";
import useTripMutations from "../composables/useTripMutations";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

const {
  loading,
  searchQuery,
  currentPage,
  totalPages,
  paginatedTrips,
  displayedPages,
  fetchMyTrips,
  changePage,
} = useTrips();

const {
  isModalOpen,
  isConfirmationModalOpen,
  modalMode,
  currentTrip,
  confirmationConfig,
  submitting,
  uploading,
  openCreateModal,
  openEditModal,
  openDeleteModal,
  saveTrip,
  uploadImage,
  removeImage,
  handleConfirmation,
} = useTripMutations(fetchMyTrips);
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
