<script setup lang="ts">
const props = defineProps<{
    message: string;
}>();
</script>

<template>
    <div class="text-center py-20 opacity-0 animate-fade-in" style="animation-fill-mode: forwards">
        <p class="text-slate-400 text-lg">
            {{ message }}
        </p>
    </div>
</template>
