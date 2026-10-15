<script setup lang="ts">
import { computed, shallowRef } from "vue";
import Mock from "mockjs";
import {
  SCard,
  SAvatar,
  SProgress,
  STag,
  SButton,
  SInput,
  SDialog,
  SSteps,
  SEmpty,
} from "sax-design-vue";
import { t } from "@/i18n";
import type { MessageKey } from "@/i18n/messages";
import PageHeading from "@/components/common/PageHeading.vue";
const projects = shallowRef(
  [
    "projects.design",
    "projects.portal",
    "projects.analytics",
    "projects.mobile",
    "projects.migration",
    "projects.website",
  ].map((key, id) => ({
    id,
    title: key as MessageKey,
    progress: id === 2 ? 100 : Mock.Random.integer(20, 85),
    members: Array.from({ length: 3 }, () => Mock.Random.cname()),
  })),
);
const keyword = shallowRef(""),
  favorites = shallowRef<number[]>([]),
  selected = shallowRef<(typeof projects.value)[number] | null>(null);
const visible = computed(() =>
  projects.value.filter((p) =>
    t(p.title).toLowerCase().includes(keyword.value.toLowerCase()),
  ),
);
const steps = computed(() =>
  ["projects.task1", "projects.task2", "projects.task3", "projects.task4"].map(
    (key) => ({ title: t(key as MessageKey) }),
  ),
);
function favorite(id: number) {
  favorites.value = favorites.value.includes(id)
    ? favorites.value.filter((v) => v !== id)
    : [...favorites.value, id];
}
</script>
<template>
  <PageHeading
    :title="t('nav.projects')"
    :caption="t('projects.caption')"
    eyebrow="COLLABORATION"
    ><SInput v-model="keyword" :label="t('projects.search')" label-float clearable
  /></PageHeading>
  <p class="text-muted text-sm mb-5" role="status">
    {{ t("projects.favoriteCount", { count: favorites.length }) }}
  </p>
  <SEmpty v-if="!visible.length" :description="t('examples.emptyCaption')" />
  <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
    <SCard
      v-for="project in visible"
      :key="project.id"
      class="admin-card"
      :title="t(project.title)"
      :subtitle="t('projects.description')"
      selectable
      :selected="favorites.includes(project.id)"
      @update:selected="favorite(project.id)"
      ><template #extra
        ><STag :color="project.progress === 100 ? 'success' : 'primary'">{{
          t(project.progress === 100 ? "projects.finished" : "projects.active")
        }}</STag></template
      >
      <div class="flex justify-between text-xs text-muted mb-3 mt-3">
        <span>{{ t("projects.progress") }}</span
        ><b>{{ project.progress }}%</b>
      </div>
      <SProgress
        :percent="project.progress"
        :color="project.progress === 100 ? 'success' : 'primary'"
      />
      <div class="flex gap-2 mt-6">
        <SAvatar
          v-for="name in project.members"
          :key="name"
          :size="32"
          shape="circle"
          :title="name"
          role="img"
          :aria-label="name"
          ><span style="font-size: 12px; line-height: 1; white-space: nowrap">{{ name.slice(-2) }}</span></SAvatar
        >
      </div>
      <template #footer
        ><div class="flex gap-2 justify-end">
          <SButton
            type="flat"
            size="small"
            @click.stop="favorite(project.id)"
            >{{ t("projects.favorite") }}</SButton
          ><SButton size="small" @click.stop="selected = project">{{
            t("projects.view")
          }}</SButton>
        </div></template
      ></SCard
    >
  </div>
  <SDialog
    :model-value="Boolean(selected)"
    :title="selected ? t(selected.title) : ''"
    width="650px"
    @update:model-value="
      (v) => {
        if (!v) selected = null;
      }
    "
    ><template v-if="selected"
      ><h3 class="section-title">{{ t("projects.target") }}</h3>
      <SSteps
        :items="steps"
        :active="Math.min(3, Math.floor(selected.progress / 25))"
        direction="vertical"
      />
      <h3 class="section-title mt-6">{{ t("projects.members") }}</h3>
      <div class="flex gap-3">
        <SAvatar
          v-for="name in selected.members"
          :key="name"
          :size="36"
          shape="circle"
          :title="name"
          role="img"
          :aria-label="name"
          ><span style="font-size: 12px; line-height: 1; white-space: nowrap">{{ name.slice(-2) }}</span></SAvatar
        >
      </div></template
    ></SDialog
  >
</template>
