<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { useRouter } from "vue-smart-router";
import { SCard, SButton, SIcon } from "sax-design-vue";
import { menusStore, menuLabel } from "@/stores/menus";
import { t } from "@/i18n";

const router = useRouter();
const menus = menusStore();
const thought = shallowRef(0);
const thoughts = [
  "workspace.thoughtOne",
  "workspace.thoughtTwo",
  "workspace.thoughtThree",
] as const;
const shortcuts = computed(() => {
  const preferred = ["/dashboard", "/users", "/orders", "/projects"];
  const available = menus.visiblePages
    .filter((page) => preferred.includes(page.path))
    .sort((a, b) => preferred.indexOf(a.path) - preferred.indexOf(b.path));
  return (available.length ? available : menus.visiblePages).slice(0, 4);
});
</script>

<template>
  <section
    class="min-h-[65vh] grid place-items-center p-3 md:p-8"
    :aria-label="t('workspace.emptyTitle')"
  >
    <SCard class="admin-card w-full max-w-210">
      <div
        class="relative overflow-hidden rounded-5 px-6 py-12 md:px-12 md:py-16 text-center bg-gradient-to-br from-brand/5 via-transparent to-brand/10"
      >
        <div
          class="mx-auto mb-7 grid h-24 w-24 place-items-center rounded-full bg-brand/8 text-brand"
          aria-hidden="true"
        >
          <SIcon name="nav:blocks" :size="44" />
        </div>
        <p class="text-xs tracking-[.2em] text-brand mb-4">
          {{ t("workspace.emptyEyebrow") }}
        </p>
        <h1 class="text-3xl md:text-4xl font-bold m-0">
          {{ t("workspace.emptyTitle") }}
        </h1>
        <p class="text-muted leading-7 mx-auto mt-5 max-w-125">
          {{ t("workspace.emptyCaption") }}
        </p>
        <div
          v-if="shortcuts.length"
          class="flex flex-wrap justify-center gap-3 mt-8"
        >
          <SButton
            v-for="(page, index) in shortcuts"
            :key="page.id"
            :type="index === 0 ? 'solid' : 'flat'"
            @click="router.push(page.path)"
          >
            <SIcon v-if="page.icon" :name="page.icon" :size="18" /><span>{{
              menuLabel(page)
            }}</span>
          </SButton>
        </div>
        <div class="mt-12">
          <p class="text-muted text-sm leading-7" aria-live="polite">
            {{ t(thoughts[thought]!) }}
          </p>
          <SButton
            class="mx-auto" size="small"
            type="transparent"
            @click="thought = (thought + 1) % thoughts.length"
            >{{ t("workspace.nextThought") }}</SButton
          >
        </div>
      </div>
    </SCard>
  </section>
</template>
