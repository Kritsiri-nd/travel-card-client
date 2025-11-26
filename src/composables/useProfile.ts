import { ref, watch } from "vue";
import useAuth, { type AuthUser } from "./useAuth";

export interface ProfileFormState {
  displayName: string;
  email: string;
  avatarUrl: string;
  bio: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export default function useProfile() {
  const { token, user, fetchCurrentUser } = useAuth();

  const form = ref<ProfileFormState>({
    displayName: "",
    email: "",
    avatarUrl: "",
    bio: "",
  });
  const isDirty = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  const uploading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  const applyUserToForm = (data: AuthUser) => {
    form.value = {
      displayName: data.displayName ?? "",
      email: data.email ?? "",
      avatarUrl: data.avatarUrl ?? "",
      bio: data.bio ?? "",
    };
  };

  // Sync form with user once on load; avoid overwriting edits while typing
  let hasSyncedOnce = false;
  watch(
    user,
    (value) => {
      if (value && !hasSyncedOnce && !isDirty.value) {
        applyUserToForm(value);
        hasSyncedOnce = true;
      }
    },
    { immediate: true }
  );

  watch(successMessage, (val) => {
    if (val) {
      setTimeout(() => {
        successMessage.value = null;
      }, 3000);
    }
  });

  watch(error, (val) => {
    if (val) {
      setTimeout(() => {
        error.value = null;
      }, 3000);
    }
  });

  const loadProfile = async () => {
    if (!token.value) return;

    loading.value = true;
    error.value = null;
    try {
      await fetchCurrentUser();
      if (user.value && !isDirty.value) {
        applyUserToForm(user.value);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
      error.value = "Unable to load your profile right now.";
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async () => {
    if (!token.value) {
      error.value = "Please sign in to update your profile.";
      return;
    }

    saving.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const payload = {
        displayName: form.value.displayName?.trim() || null,
        avatarUrl: form.value.avatarUrl?.trim() || null,
        bio: form.value.bio?.trim() ?? "",
      };

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to update profile");
      }

      const updatedUser = (await response.json()) as AuthUser;
      user.value = updatedUser;
      applyUserToForm(updatedUser);
      isDirty.value = false;
      successMessage.value = "Profile updated successfully.";
    } catch (err) {
      console.error("Failed to update profile", err);
      error.value =
        err instanceof Error ? err.message : "Failed to update profile.";
    } finally {
      saving.value = false;
    }
  };

  const uploadAvatarFromFile = async (file: File) => {
    if (!token.value) {
      error.value = "Please sign in to upload a photo.";
      return;
    }

    uploading.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error("Avatar upload failed");
      }

      const data = await response.json();
      if (data?.url) {
        form.value = { ...form.value, avatarUrl: data.url };
        isDirty.value = true;
      }
    } catch (err) {
      console.error("Failed to upload avatar", err);
      error.value =
        err instanceof Error ? err.message : "Failed to upload avatar.";
    } finally {
      uploading.value = false;
    }
  };

  return {
    form,
    isDirty,
    loading,
    saving,
    uploading,
    error,
    successMessage,
    loadProfile,
    updateProfile,
    uploadAvatarFromFile,
    setForm: (value: ProfileFormState) => {
      form.value = value;
      isDirty.value = true;
    },
  };
}
