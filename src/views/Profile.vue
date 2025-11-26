<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../composables/useAuth";
import useProfile from "../composables/useProfile";
import ProfileForm from "../components/ProfileForm.vue";
import ConfirmationModal from "../components/ConfirmationModal.vue";

const router = useRouter();
const { token, isFetchingUser } = useAuth();

const {
  form,
  loading,
  saving,
  error,
  successMessage,
  loadProfile,
  updateProfile,
  uploadAvatarFromFile,
  setForm,
} = useProfile();

const isBusy = computed(() => loading.value || isFetchingUser.value);
const isModalOpen = ref(false);

const handleFormSubmit = () => {
  isModalOpen.value = true;
};

const handleValidationFailed = () => {
  error.value = "Validation failed. Please check the form.";
};

const handleConfirmSave = async () => {
  isModalOpen.value = false;
  await updateProfile();
};

const handleAvatarUpload = (file: File) => {
  uploadAvatarFromFile(file);
};

onMounted(async () => {
  if (!token.value) {
    router.push({ name: "login" });
    return;
  }
  await loadProfile();
});
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-200 selection:text-cyan-900"
  >
    <div class="max-w-5xl mx-auto px-6 py-12 lg:py-20 space-y-12">
      <!-- Header Section -->
      <div
        class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-200"
      >
        <div>
          <h1
            class="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
          >
            Profile Settings
          </h1>
          <p class="text-slate-500 mt-2 text-lg">
            Manage your personal information and public profile.
          </p>
        </div>
      </div>

      <!-- Notifications -->
      <transition-group name="fade" tag="div" class="space-y-4">
        <div
          v-if="error"
          key="error"
          class="flex items-start gap-3 px-4 py-4 rounded-xl bg-red-50 text-red-700 border border-red-200"
        >
          <span class="pi pi-exclamation-circle mt-0.5 text-red-500"></span>
          <span class="text-sm">{{ error }}</span>
        </div>
        <div
          v-if="successMessage"
          key="success"
          class="flex items-start gap-3 px-4 py-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          <span class="pi pi-check-circle mt-0.5 text-emerald-500"></span>
          <span class="text-sm">{{ successMessage }}</span>
        </div>
      </transition-group>

      <!-- Profile Form Component -->
      <ProfileForm
        :form="form"
        :loading="isBusy"
        :saving="saving"
        @update:form="setForm"
        @submit="handleFormSubmit"
        @validation-failed="handleValidationFailed"
        @uploadAvatar="handleAvatarUpload"
      />
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="isModalOpen"
      title="Save Changes?"
      message="Are you sure you want to update your profile information?"
      confirm-text="Save Changes"
      confirm-color="cyan"
      icon-type="edit"
      :loading="saving"
      @close="isModalOpen = false"
      @confirm="handleConfirmSave"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
