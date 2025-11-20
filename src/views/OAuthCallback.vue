<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import useAuth from "../composables/useAuth";

const route = useRoute();
const router = useRouter();
const { setToken, fetchCurrentUser } = useAuth();

const statusMessage = ref("กำลังยืนยันตัวตน...");

onMounted(async () => {
    const tokenParam = route.query.token;
    if (!tokenParam || typeof tokenParam !== "string") {
        statusMessage.value = "ไม่พบโทเค็นสำหรับเข้าสู่ระบบ";
        setTimeout(() => router.replace({ name: "login" }), 1500);
        return;
    }

    setToken(tokenParam);
    await fetchCurrentUser();
    router.replace({ name: "home" });
});
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div class="text-center space-y-4">
            <div class="mx-auto h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm font-semibold">{{ statusMessage }}</p>
        </div>
    </div>
</template>
