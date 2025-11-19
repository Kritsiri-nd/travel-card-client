<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        count?: number;
    }>(),
    {
        count: 3,
    },
);
</script>

<template>
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
            v-for="n in count"
            :key="n"
            class="bg-white rounded-3xl h-[400px] border border-slate-100 shadow-sm p-4 space-y-4 animate-pulse"
        >
            <div class="h-48 bg-slate-200 rounded-2xl w-full"></div>
            <div class="space-y-2">
                <div class="h-4 bg-slate-200 rounded w-1/3"></div>
                <div class="h-6 bg-slate-200 rounded w-3/4"></div>
                <div class="h-4 bg-slate-200 rounded w-full"></div>
            </div>
        </div>
    </div>
</template>
