<script setup lang="ts">
defineProps<{ title: string; caption: string; eyebrow?: string }>();
</script>
<template>
  <div class="flex flex-wrap items-end justify-between gap-4 mb-7">
    <div>
      <p
        v-if="eyebrow"
        class="text-11px tracking-[.14em] font-600 text-muted uppercase mb-2"
      >
        {{ eyebrow }}
      </p>
      <h1 class="page-title m-0">{{ title }}</h1>
      <p class="page-caption mb-0">{{ caption }}</p>
    </div>
    <div class="flex items-center gap-3"><slot /></div>
  </div>
</template>
