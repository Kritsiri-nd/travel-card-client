<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../composables/useAuth";

const router = useRouter();
const { user, isAuthenticated, logout } = useAuth();

const isMenuOpen = ref(false);
const isDropdownOpen = ref(false);

const userInitial = computed(() => {
  if (!user.value) return "?";
  const source = user.value.displayName || user.value.email || "?";
  return source.charAt(0).toUpperCase();
});

const userPhoto = computed(() => {
  if (!user.value) return "";
  const preferred =
    (user.value as any).photoUrl ||
    (user.value as any).avatarUrl ||
    (user.value as any).picture ||
    (user.value as any).imageUrl;
  if (typeof preferred === "string" && preferred.trim()) {
    return preferred;
  }
  const name = encodeURIComponent(
    user.value.displayName || user.value.email || "Traveler"
  );
  return `https://ui-avatars.com/api/?name=${name}&background=22c55e&color=fff`;
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) isDropdownOpen.value = false;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const goToLogin = () => {
  closeMenu();
  router.push({ name: "login" });
};

const handleLogout = () => {
  closeMenu();
  closeDropdown();
  logout();
  router.push({ name: "home" });
};

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const nav = document.querySelector("nav");
  const dropdown = document.getElementById("user-dropdown");
  const target = event.target as Node;

  if (isMenuOpen.value && nav && !nav.contains(target)) {
    closeMenu();
  }

  if (isDropdownOpen.value && dropdown && !dropdown.contains(target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <header
    class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm"
  >
    <nav class="max-w-6xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <RouterLink
          to="/"
          class="flex items-center gap-2 text-xl font-semibold text-slate-900"
          @click="closeMenu"
        >
          <span
            class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-white font-bold shadow-sm ring-1 ring-cyan-200 animate-pop"
          >
            T
          </span>
          <span>TravelApp</span>
        </RouterLink>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-3">
          <template v-if="isAuthenticated">
            <div class="relative" id="user-dropdown">
              <button
                @click.stop="toggleDropdown"
                class="flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-3 bg-white shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <div class="relative h-8 w-8">
                  <img
                    v-if="userPhoto"
                    :src="userPhoto"
                    alt="User avatar"
                    class="h-8 w-8 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                  <span
                    v-else
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 font-semibold text-xs"
                  >
                    {{ userInitial }}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-gray-400 transition-transform duration-200"
                  :class="{ 'rotate-180': isDropdownOpen }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <Transition name="fade-zoom">
                <div
                  v-if="isDropdownOpen"
                  class="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 origin-top-right"
                >
                  <div class="px-2 py-2 mb-2 border-b border-gray-50">
                    <p class="text-sm font-semibold text-gray-900 truncate">
                      {{ user?.displayName || "User" }}
                    </p>
                    <p class="text-xs text-gray-500 truncate">
                      {{ user?.email }}
                    </p>
                  </div>

                  <div class="flex flex-col gap-2">
                    <RouterLink
                      to="/my-trips"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 text-left flex items-center gap-2 transition-colors"
                      @click="closeDropdown"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      My Trips
                    </RouterLink>

                    <RouterLink
                      to="/profile"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 text-left flex items-center gap-2 transition-colors"
                      @click="closeDropdown"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Profile
                    </RouterLink>

                    <button
                      @click="handleLogout"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 text-left flex items-center gap-2 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>

          <div v-else class="flex items-center gap-3">
            <button
              class="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 transition hover:-translate-y-0.5"
              @click="goToLogin"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>

        <!-- Hamburger Button -->
        <button
          class="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
          @click.stop="toggleMenu"
          aria-label="Toggle menu"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="!isMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition name="slide-down">
        <div
          v-if="isMenuOpen"
          class="md:hidden mt-4 pb-4 border-t border-slate-100"
        >
          <div class="flex flex-col gap-4 pt-4">
            <template v-if="isAuthenticated">
              <div class="flex items-center gap-3 px-2">
                <div class="relative h-10 w-10">
                  <img
                    v-if="userPhoto"
                    :src="userPhoto"
                    alt="User avatar"
                    class="h-10 w-10 rounded-full object-cover border border-slate-200 shadow"
                  />
                  <span
                    v-else
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 font-semibold text-sm"
                  >
                    {{ userInitial }}
                  </span>
                </div>
                <div class="text-sm">
                  <p class="font-semibold text-slate-900">
                    {{ user?.displayName || user?.email }}
                  </p>
                  <p class="text-xs text-slate-500">เข้าสู่ระบบแล้ว</p>
                </div>
              </div>

              <RouterLink
                to="/my-trips"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 text-left flex items-center gap-2"
                @click="closeMenu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                My Trips
              </RouterLink>

              <RouterLink
                to="/profile"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 text-left flex items-center gap-2"
                @click="closeMenu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Profile
              </RouterLink>

              <button
                class="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 text-left flex items-center gap-2"
                @click="handleLogout"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                ออกจากระบบ
              </button>
            </template>

            <div v-else class="flex flex-col gap-3">
              <button
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                @click="goToLogin"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<style scoped>
.fade-zoom-enter-active,
.fade-zoom-leave-active {
  transition: all 220ms ease;
}

.fade-zoom-enter-from,
.fade-zoom-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 300px;
  opacity: 1;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.animate-pop {
  animation: pop 0.4s ease;
}

@keyframes pop {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.avatar-ring {
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.avatar-ring:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.3);
}
</style>
