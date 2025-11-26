<script setup lang="ts">
import { computed, ref } from "vue";
import type { ProfileFormState } from "../composables/useProfile";

const props = defineProps<{
  form: ProfileFormState;
  saving?: boolean;
  uploading?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:form", value: ProfileFormState): void;
  (e: "submit"): void;
  (e: "uploadAvatar", file: File): void;
  (e: "validation-failed"): void;
}>();

const isBusy = computed(() => props.saving || props.loading);
const errors = ref<{ displayName?: string }>({});

const avatarPreview = computed(() => {
  const base = props.form.displayName?.trim() || props.form.email || "Traveler";
  const fallback =
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(base) +
    "&background=0ea5e9&color=fff";
  return props.form.avatarUrl?.trim() || fallback;
});

const displayNameModel = computed({
  get: () => props.form.displayName,
  set: (value: string) => {
    emit("update:form", { ...props.form, displayName: value });
    if (errors.value.displayName) validate();
  },
});

const bioModel = computed({
  get: () => props.form.bio,
  set: (value: string) => {
    emit("update:form", { ...props.form, bio: value });
  },
});

const validate = () => {
  errors.value = {};
  let isValid = true;

  if (!props.form.displayName?.trim()) {
    errors.value.displayName = "Display name is required.";
    isValid = false;
  } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(props.form.displayName)) {
    errors.value.displayName =
      "Display name can only contain letters, numbers, spaces, hyphens, and underscores.";
    isValid = false;
  }

  return isValid;
};

const handleSubmit = () => {
  if (validate()) {
    emit("submit");
  } else {
    emit("validation-failed");
  }
};

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    emit("uploadAvatar", file);
  }
  input.value = "";
};

const triggerAvatarSelect = () => {
  document.getElementById("avatar-upload-input")?.click();
};
</script>

<template>
  <div class="grid lg:grid-cols-12 gap-12">
    <!-- Left Column: Avatar & Quick Stats -->
    <div class="lg:col-span-4 space-y-8">
      <div
        class="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-xl shadow-slate-200/50"
      >
        <div class="relative group">
          <div
            class="h-40 w-40 rounded-full overflow-hidden border-4 border-white shadow-2xl ring-4 ring-slate-100"
          >
            <img
              :src="avatarPreview"
              alt="Profile picture"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <button
            type="button"
            class="absolute bottom-2 right-2 p-3 rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-400 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-500/30"
            @click="triggerAvatarSelect"
            title="Change Avatar"
          >
            <span class="pi pi-camera text-lg"></span>
          </button>
        </div>

        <div class="mt-6 space-y-1">
          <h2 class="text-xl font-bold text-slate-900">
            {{ form.displayName || "Traveler" }}
          </h2>
          <p class="text-sm text-slate-500">{{ form.email }}</p>
        </div>

        <input
          id="avatar-upload-input"
          type="file"
          accept="image/*"
          class="hidden"
          :disabled="isBusy"
          @change="onFileChange"
        />
      </div>
    </div>

    <!-- Right Column: Form -->
    <div class="lg:col-span-8 space-y-6">
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Personal Info Section -->
        <div class="space-y-6">
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 ml-1"
                >Display Name</label
              >
              <input
                type="text"
                v-model="displayNameModel"
                :disabled="isBusy"
                maxlength="50"
                placeholder="e.g. Alex Roamer"
                class="w-full rounded-xl bg-white border border-slate-300 text-slate-900 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-50 disabled:bg-slate-50"
                :class="{
                  'border-red-300 focus:border-red-500 focus:ring-red-500/50':
                    errors.displayName,
                }"
              />
              <p v-if="errors.displayName" class="text-xs text-red-500 ml-1">
                {{ errors.displayName }}
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 ml-1"
                >Email Address</label
              >
              <div class="relative">
                <input
                  type="email"
                  :value="form.email"
                  readonly
                  class="w-full rounded-xl bg-slate-100 border border-slate-200 text-slate-500 px-4 py-3 text-sm focus:outline-none cursor-not-allowed select-none"
                />
                <span
                  class="absolute inset-y-0 right-4 flex items-center text-slate-400"
                >
                  <span class="pi pi-lock text-xs"></span>
                </span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 ml-1">Bio</label>
            <textarea
              rows="5"
              v-model="bioModel"
              :disabled="isBusy"
              maxlength="500"
              placeholder="Tell us a bit about yourself..."
              class="w-full rounded-xl bg-white border border-slate-300 text-slate-900 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none disabled:opacity-50 disabled:bg-slate-50"
            ></textarea>
            <div class="flex justify-end text-xs text-slate-500 px-1">
              <span>{{ bioModel?.length || 0 }}/500</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="pt-6 border-t border-slate-200 flex items-center justify-end gap-4"
        >
          <!-- Cancel button removed as it's usually handled by parent or navigation -->
          <button
            type="submit"
            :disabled="isBusy || saving"
            class="px-8 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-semibold shadow-lg shadow-cyan-900/20 hover:bg-cyan-500 hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            <span v-if="saving" class="flex items-center gap-2">
              <span class="pi pi-spinner pi-spin"></span>
              Saving...
            </span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
