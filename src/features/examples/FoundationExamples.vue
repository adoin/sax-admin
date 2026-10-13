<script setup lang="ts">
import { shallowRef, onBeforeUnmount } from "vue";
import {
  SCard,
  SButton,
  SAvatar,
  SBadge,
  STag,
  STabs,
  STab,
} from "sax-design-vue";
import { Bell } from "lucide-vue-next";
import { t } from "@/i18n";
const busy = shallowRef(false),
  tags = shallowRef(["Vue 3", "TypeScript", "Sax Design Vue"]),
  tab = shallowRef("overview");
let timer: ReturnType<typeof setTimeout> | undefined;
function run() {
  busy.value = true;
  timer = setTimeout(() => {
    busy.value = false;
  }, 1200);
}
onBeforeUnmount(() => clearTimeout(timer));
</script>
<template>
  <div class="grid md:grid-cols-2 gap-5">
    <SCard
      class="admin-card"
      :title="t('examples.buttons')"
      :subtitle="t('examples.buttonsCaption')"
      ><div class="flex flex-wrap gap-3">
        <SButton>{{ t("examples.primary") }}</SButton
        ><SButton type="flat">{{ t("examples.secondary") }}</SButton
        ><SButton color="success">{{ t("examples.success") }}</SButton
        ><SButton type="flat" color="danger">{{ t("examples.danger") }}</SButton
        ><SButton :loading="busy" @click="run">{{ t("examples.run") }}</SButton>
      </div></SCard
    ><SCard class="admin-card" :title="t('examples.avatars')"
      ><div class="flex gap-5 items-center flex-wrap">
        <SAvatar shape="circle"><template #text>Adoin Wang</template></SAvatar
        ><SAvatar color="success"><template #text>Sax</template></SAvatar
        ><SAvatar shape="square"><template #text>Team</template></SAvatar
        ><SBadge :value="12"
          ><SButton type="flat" icon :aria-label="t('shell.notifications')"
            ><Bell :size="20" /></SButton></SBadge
        ><SBadge is-dot
          ><SAvatar shape="circle"
            ><template #text>Online</template></SAvatar
          ></SBadge
        >
      </div></SCard
    ><SCard class="admin-card" :title="t('examples.tags')"
      ><div class="flex gap-3 flex-wrap">
        <STag
          v-for="tag in tags"
          :key="tag"
          closable
          :aria-label="`${t('examples.tagClose')} ${tag}`"
          @close="tags = tags.filter((v) => v !== tag)"
          >{{ tag }}</STag
        ><STag color="success">{{ t("status.active") }}</STag
        ><STag color="warn">{{ t("orders.pending") }}</STag
        ><SButton
          type="flat"
          size="small"
          @click="tags = ['Vue 3', 'TypeScript', 'Sax Design Vue']"
          >{{ t("examples.restore") }}</SButton
        >
      </div></SCard
    ><SCard class="admin-card" :title="t('examples.tabs')"
      ><STabs v-model="tab" type="pill"
        ><STab name="overview" :label="t('examples.overview')"
          ><p class="text-muted py-4">{{ t("examples.tabOverview") }}</p></STab
        ><STab name="activity" :label="t('examples.activity')"
          ><p class="text-muted py-4">{{ t("examples.tabActivity") }}</p></STab
        ></STabs
      ></SCard
    >
  </div>
</template>
