<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../composables/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const AUTH_SERVER_BASE_URL =
    import.meta.env.VITE_AUTH_SERVER_BASE_URL ?? resolveAuthServerBase(API_BASE_URL);

const router = useRouter();
const { setToken, fetchCurrentUser } = useAuth();

const form = ref({
    email: "",
    password: ""
});

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

function resolveAuthServerBase(apiBase: string) {
    try {
        const url = new URL(apiBase, window.location.origin);
        let pathname = url.pathname.replace(/\/$/, "");
        if (pathname.endsWith("/api")) {
            pathname = pathname.slice(0, -4);
        }
        if (pathname === "/") {
            pathname = "";
        }
        return `${url.origin}${pathname}`;
    } catch {
        return window.location.origin;
    }
}

const redirectToProvider = (provider: "google" | "line") => {
    window.location.href = `${AUTH_SERVER_BASE_URL}/oauth2/authorization/${provider}`;
};

const handleLogin = async () => {
    if (!form.value.email || !form.value.password) {
        errorMessage.value = "กรุณากรอกอีเมลและรหัสผ่าน";
        successMessage.value = null;
        return;
    }

    isLoading.value = true;
    errorMessage.value = null;
    successMessage.value = null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: form.value.email,
                password: form.value.password
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message ?? "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        const data = await response.json();
        setToken(data.token);
        await fetchCurrentUser();
        successMessage.value = "เข้าสู่ระบบสำเร็จ!";
        router.push({ name: "home" });
    } catch (err) {
        console.error("เข้าสู่ระบบล้มเหลว", err);
        errorMessage.value = err instanceof Error ? err.message : "ไม่สามารถเข้าสู่ระบบได้";
    } finally {
        isLoading.value = false;
    }
};

const loginWithGoogle = () => redirectToProvider("google");

const loginWithLine = () => redirectToProvider("line");
</script>

<template>
    <div class="min-h-screen flex bg-white font-sans text-slate-900">

        <div
            class="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24 py-12 relative z-10 bg-white">

            <a href="/"
                class="absolute top-8 left-8 sm:left-12 text-slate-400 hover:text-cyan-600 transition-colors flex items-center gap-2 text-sm font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                กลับ
            </a>

            <div class="mb-10 mt-8">
                <div class="flex items-center gap-2 mb-6">
                    
                    
                </div>
                <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">ยินดีต้อนรับกลับ!</h1>
                <p class="text-slate-500 text-base">กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button @click="loginWithGoogle" type="button"
                    class="flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                            fill="#4285F4" />
                        <path
                            d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
                            fill="#34A853" />
                        <path
                            d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
                            fill="#FBBC05" />
                        <path
                            d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                            fill="#EA4335" />
                    </svg>
                    <span class="text-sm font-bold text-slate-600 group-hover:text-slate-800">Google</span>
                </button>

                <button @click="loginWithLine" type="button"
                    class="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] transition-all duration-200 group shadow-sm hover:shadow-md text-white">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M22.4 10.8c0-5.2-5-9.5-10.8-9.5C5.4 1.3.8 5.6.8 10.8c0 4.7 4.2 8.6 9 9.4-.1.8-.3 1.7-.5 2.4-.1.4-.2.8-.3 1.1 0 .1-.1.2 0 .3 0 .2.2.3.4.2 1.8-1.1 5-3.2 6.8-5.5 3.8-.7 6.2-4.1 6.2-7.9z" />
                    </svg>
                    <span class="text-sm font-bold">LINE</span>
                </button>
            </div>

            <div class="relative flex py-2 items-center mb-8">
                <div class="flex-grow border-t border-slate-200"></div>
                <span class="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">หรือเข้าสู่ระบบด้วยอีเมล</span>
                <div class="flex-grow border-t border-slate-200"></div>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
                <div v-if="errorMessage" class="w-full rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
                    {{ errorMessage }}
                </div>

                <div v-if="successMessage" class="w-full rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
                    {{ successMessage }}
                </div>

                <div class="space-y-1.5">
                    <label class="text-sm font-semibold text-slate-700">อีเมล</label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input v-model="form.email" type="email"
                            class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
                            placeholder="name@example.com" required />
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label class="text-sm font-semibold text-slate-700">รหัสผ่าน</label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                            class="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
                            placeholder="••••••••" required />
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                            <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.574-2.936m3.1-2.827c.524-.308 1.085-.567 1.677-.757M15 15l-3-3m0 0l3 3m-3-3l3 3M9 9l3-3m0 0l3 3m-3-3l3 3" />
                            </svg>
                        </button>
                    </div>
                </div>

                <button type="submit" :disabled="isLoading"
                    class="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-cyan-500/20 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
                    <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
                </button>
            </form>

            <p class="mt-8 text-center text-sm text-slate-600">
                ยังไม่มีบัญชี?
                <a href="#" class="font-bold text-cyan-600 hover:text-cyan-500 transition-colors">สมัครสมาชิกตอนนี้</a>
            </p>
        </div>

        <div class="hidden lg:block relative w-1/2 bg-slate-900 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Switzerland" class="absolute inset-0 w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

            <div class="absolute bottom-0 left-0 right-0 p-16 text-white">
                <div
                    class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md animate-slide-up">
                    <div class="flex items-center gap-2 mb-4 text-yellow-400">
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <p class="text-lg font-medium italic mb-3">"ภูเขากำลังเรียกหาและฉันต้องไป แอปนี้ทำให้การวางแผนทริปเดินป่าของฉันง่ายสุดๆ!"</p>
                    <div class="flex items-center gap-3">
                        <img src="https://i.pravatar.cc/100?img=12" class="w-8 h-8 rounded-full border border-white/50"
                            alt="Reviewer" />
                        <span class="text-sm font-bold text-slate-200">Jame K. • นักเดินป่าสมัครเล่น</span>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* Custom animations */
@keyframes slide-up {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.animate-slide-up {
    animation: slide-up 0.8s ease-out forwards;
}
</style>
