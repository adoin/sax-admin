<script setup lang="ts">
import { t } from "@/i18n";
import { RouterLink } from "vue-smart-router";
</script>
<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-5">
    <span class="text-24 text-brand font-800">404</span>
    <h1>{{ t("notFound.body") }}</h1>
    <RouterLink
      to="/dashboard"
      class="bg-brand text-white px-6 py-3 rounded-3"
      >{{ t("notFound.back") }}</RouterLink
    >
  </main>
</template>
