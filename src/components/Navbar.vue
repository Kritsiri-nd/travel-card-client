<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../composables/useAuth";

const router = useRouter();
const { user, isAuthenticated, logout } = useAuth();

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
    const name = encodeURIComponent(user.value.displayName || user.value.email || "Traveler");
    return `https://ui-avatars.com/api/?name=${name}&background=22c55e&color=fff`;
});

const goToLogin = () => router.push({ name: "login" });
const goToRegister = () => router.push({ name: "register" });

const handleLogout = () => {
    logout();
    router.push({ name: "home" });
};
</script>

<template>
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <RouterLink to="/" class="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <span
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-white font-bold shadow-sm ring-1 ring-cyan-200 animate-pop">
                    T
                </span>
                <span>TravelApp</span>
            </RouterLink>

            <template v-if="isAuthenticated">
                <Transition name="fade-zoom">
                    <div class="flex items-center gap-3">
                        <div
                            class="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 bg-white shadow-sm">
                            <div class="relative h-9 w-9">
                                <img v-if="userPhoto" :src="userPhoto" alt="User avatar"
                                    class="h-9 w-9 rounded-full object-cover border border-slate-200 shadow avatar-ring" />
                                <span v-else
                                    class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 font-semibold text-sm">
                                    {{ userInitial }}
                                </span>
                            </div>
                            <div class="text-sm">
                                <p class="font-semibold leading-tight">{{ user?.displayName || user?.email }}</p>
                            </div>
                        </div>
                        <button
                            class="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow hover:bg-slate-800 transition hover:-translate-y-0.5"
                            @click="handleLogout">
                            ออกจากระบบ
                        </button>
                    </div>
                </Transition>
            </template>

            <div v-else class="flex items-center gap-3">
                <button
                    class="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 transition hover:-translate-y-0.5"
                    @click="goToLogin">
                    เข้าสู่ระบบ
                </button>
                <button
                    class="px-4 py-2 rounded-full bg-cyan-500 text-white text-sm font-semibold shadow hover:bg-cyan-600 transition hover:-translate-y-0.5"
                    @click="goToRegister">
                    สมัครสมาชิก
                </button>
            </div>
        </div>
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
