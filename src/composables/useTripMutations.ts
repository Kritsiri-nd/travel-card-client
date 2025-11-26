import { ref } from "vue";
import type { Trip } from "../types/trip";
import useAuth from "./useAuth";

export default function useTripMutations(refreshTrips: () => Promise<void>) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
  const { token } = useAuth();

  const isModalOpen = ref(false);
  const isConfirmationModalOpen = ref(false);
  const modalMode = ref<"create" | "edit">("create");
  const currentTrip = ref<Partial<Trip>>({});
  const pendingTripData = ref<any>(null);
  const submitting = ref(false);
  const uploading = ref(false);

  const confirmationConfig = ref({
    title: "",
    message: "",
    confirmText: "",
    confirmColor: "red" as "red" | "cyan",
    iconType: "delete" as "delete" | "edit",
    action: "delete" as "delete" | "edit" | "create",
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
    currentTrip.value = trip; // Using currentTrip to store the trip to delete
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
        action: "create",
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

      await refreshTrips();
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

  const deleteTrip = async () => {
    if (!currentTrip.value.id) return;
    submitting.value = true;
    try {
      const response = await fetch(
        `${API_BASE_URL}/trips/${currentTrip.value.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete trip");

      await refreshTrips();
      isConfirmationModalOpen.value = false;
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip.");
    } finally {
      submitting.value = false;
      currentTrip.value = {}; // Clear current trip
    }
  };

  const handleConfirmation = async () => {
    if (confirmationConfig.value.action === "delete") {
      await deleteTrip();
    } else {
      await executeSaveTrip(pendingTripData.value);
    }
  };

  return {
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
  };
}
