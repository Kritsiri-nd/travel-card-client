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

const goToLogin = () => {
    router.push({ name: "login" });
};

const handleLogout = () => {
    logout();
    router.push({ name: "home" });
};
</script>

<template>
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <RouterLink to="/" class="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-white font-bold">
                    T
                </span>
                <span>TravelApp</span>
            </RouterLink>

            <div v-if="isAuthenticated" class="flex items-center gap-3">
                <div class="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 bg-white">
                    <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 font-semibold text-sm">
                        {{ userInitial }}
                    </span>
                    <div class="text-sm">
                        <p class="font-semibold leading-tight">{{ user?.displayName || user?.email }}</p>
                        <p class="text-slate-400 text-xs">กำลังใช้งาน</p>
                    </div>
                </div>
                <button
                    class="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow hover:bg-slate-800 transition"
                    @click="handleLogout">
                    ออกจากระบบ
                </button>
            </div>

            <div v-else class="flex items-center gap-3">
                <button
                    class="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 transition"
                    @click="goToLogin">
                    เข้าสู่ระบบ
                </button>
                <button
                    class="px-4 py-2 rounded-full bg-cyan-500 text-white text-sm font-semibold shadow hover:bg-cyan-600 transition"
                    @click="goToLogin">
                    สมัครสมาชิก
                </button>
            </div>
        </div>
    </header>
</template>
