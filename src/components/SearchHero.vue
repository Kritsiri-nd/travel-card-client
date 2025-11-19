<script setup lang="ts">
const props = defineProps<{
    modelValue: string;
}>();

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();

const clear = () => emit("update:modelValue", "");
</script>

<template>
    <header class="text-center space-y-8 max-w-3xl mx-auto animate-fade-in-up">
        <div class="space-y-4">
            <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                “ชีวิตมันสั้น…<br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 animate-gradient-x">
                    แต่วันลายังเหลืออยู่”
                </span>
            </h1>
            <p class="text-slate-500 text-lg">กดหาเที่ยวก่อน เดี๋ยวค่อยคิดเรื่องเงิน</p>
        </div>

        <div class="relative max-w-xl mx-auto group transition-all duration-300 transform hover:-translate-y-1">
            <div
                class="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"
            ></div>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg
                        class="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    :value="modelValue"
                    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="หาที่เที่ยว แล้วไปกัน..."
                    class="block w-full pl-12 pr-4 py-4 bg-white border-none rounded-full shadow-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all"
                />
                <button
                    v-if="modelValue"
                    @click="clear"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </header>
</template>
