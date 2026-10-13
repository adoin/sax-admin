<script setup lang="ts">
import { shallowRef } from "vue";
import { SCard, SAvatar, SButton, SSwitch } from "sax-design-vue";
import { t } from "@/i18n";
const selected = shallowRef(false),
  loading = shallowRef(false),
  articleOpen = shallowRef(false);
</script>
<template>
  <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
    <SCard
      class="admin-card"
      :title="t('examples.defaultCard')"
      :subtitle="t('examples.cardDescription')"
      ><p class="text-muted">SCard · default</p></SCard
    ><SCard
      class="admin-card"
      type="metric"
      title="¥128,640"
      :subtitle="t('metric.revenue')"
      ><template #text
        ><p class="text-muted">{{ t("examples.metricCard") }}</p>
        <p class="text-emerald-600">+18.6%</p></template
      ></SCard
    ><SCard
      class="admin-card"
      type="profile"
      title="Alex Morgan"
      :subtitle="t('examples.profileCard')"
      ><template #img
        ><div class="flex justify-center p-6 bg-blue-50 dark:bg-slate-800">
          <SAvatar :size="64" shape="circle"
            ><template #text>Alex Morgan</template></SAvatar
          >
        </div></template
      ><template #text
        ><p>{{ t("role.admin") }}</p></template
      ></SCard
    ><SCard
      class="admin-card"
      type="article"
      :title="t('examples.articleCard')"
      :subtitle="t('examples.cardDescription')"
      ><template #text
        ><p class="leading-7 text-muted">{{ t("examples.articleText") }}</p>
        <p v-if="articleOpen">{{ t("settings.aboutBody") }}</p></template
      ><template #footer
        ><SButton type="flat" @click="articleOpen = !articleOpen">{{
          t("examples.read")
        }}</SButton></template
      ></SCard
    ><SCard
      class="admin-card"
      :title="t('examples.selectable')"
      selectable
      v-model:selected="selected"
      ><p>
        {{ t(selected ? "examples.selected" : "examples.unselected") }}
      </p></SCard
    ><SCard class="admin-card" shape="square" :title="t('examples.square')"
      ><p class="text-muted">shape="square"</p></SCard
    ><SCard
      class="admin-card"
      texture="liquid-glass"
      :title="t('examples.frosted')"
      ><p class="text-muted">texture="liquid-glass"</p></SCard
    ><SCard class="admin-card" effect="spotlight" :title="t('examples.effect')"
      ><p class="text-muted">effect="spotlight"</p></SCard
    >
    <div>
      <label class="flex items-center gap-3 mb-3 text-sm"
        ><SSwitch v-model="loading" :aria-label="t('examples.cardState')" />{{
          t("examples.cardState")
        }}</label
      ><SCard
        class="admin-card"
        :loading="loading"
        :title="t('examples.cardState')"
        ><p>{{ t("examples.cardDescription") }}</p></SCard
      >
    </div>
  </div>
</template>
