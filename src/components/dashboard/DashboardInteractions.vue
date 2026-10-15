<script setup lang="ts">
import { computed, reactive, shallowRef } from "vue";
import { useRouter } from "vue-smart-router";
import {
  SCard,
  SCheckbox,
  SProgress,
  SButton,
  STag,
} from "sax-design-vue";
import { t } from "@/i18n";

const router = useRouter();
const followed = shallowRef(false);
const tasks = reactive([
  { label: "dashboard.checkOrders" as const, checked: false },
  { label: "dashboard.checkMembers" as const, checked: false },
  { label: "dashboard.checkTrends" as const, checked: false },
]);
const completed = computed(() => tasks.filter((task) => task.checked).length);
const progress = computed(() =>
  Math.round((completed.value / tasks.length) * 100),
);
</script>

<template>
  <section :aria-label="t('dashboard.interactions')">
    <div class="grid lg:grid-cols-2 gap-5 items-stretch">
      <SCard
        class="admin-card h-full"
        hover-effect="glow"
        effect="spotlight"
        color="success"
        :title="t('dashboard.checklist')"
        :subtitle="t('dashboard.checklistCaption')"
      >
        <div class="grid gap-4">
          <SCheckbox
            v-for="task in tasks"
            :key="task.label"
            v-model="task.checked"
            >{{ t(task.label) }}</SCheckbox
          >
        </div>
        <div class="flex justify-between items-center text-sm mt-6 mb-3">
          <span class="text-muted">{{
            t("dashboard.checkProgress", { completed, total: tasks.length })
          }}</span>
          <STag :color="completed === tasks.length ? 'success' : 'primary'"
            >{{ progress }}%</STag
          >
        </div>
        <SProgress
          :percent="progress"
          :height="8"
          color="success"
          texture="waves"
          :texture-animated="progress > 0 && progress < 100"
          :aria-label="t('dashboard.checklist')"
        />
        <p class="text-xs text-muted leading-6 mb-0">
          {{ t("dashboard.localInteraction") }}
        </p>
      </SCard>
      <div
        class="rounded-5 p-5 grid items-center bg-slate-900"
        style="
          background-image:
            linear-gradient(
              135deg,
              rgb(15 23 42 / 0.86),
              rgb(30 64 175 / 0.72)
            ),
            url(&quot;/media-analytics.svg&quot;);
          background-size: cover;
          background-position: center;
        "
      >
        <SCard
          v-model:selected="followed"
          class="admin-card"
          style="--sax-css-background: #0f172a"
          texture="liquid-glass"
          effect="gradient-glow"
          hover-effect="glow"
          selectable
          :title="t('dashboard.focusTitle')"
          :text="t('dashboard.focusCaption')"
        >
          <div class="flex flex-wrap items-center gap-2 mb-5">
            <STag>{{ t("dashboard.glassSurface") }}</STag>
            <STag :color="followed ? 'success' : 'primary'">{{
              t(followed ? "dashboard.followed" : "dashboard.follow")
            }}</STag>
          </div>
          <p class="text-sm leading-7 mb-0">{{ t("dashboard.focusHint") }}</p>
          <template #footer>
            <SButton @click.stop="router.push('/settings')">{{
              t("dashboard.openPreferences")
            }}</SButton>
          </template>
        </SCard>
      </div>
    </div>

  </section>
</template>
