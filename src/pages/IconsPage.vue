<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { SIcon, SCard, SSelect, SAlert, SCodeBlock, STag } from "sax-design-vue";
import ExampleSections from "@/components/common/ExampleSections.vue";
import PageHeading from "@/components/common/PageHeading.vue";
import { iconBuildProbe } from "@/icons/tree-shaking-proof";
import apiCode from "../../sax-icons.config.ts?raw";
import { t } from "@/i18n";

const selected = shallowRef("demo:house");
const options = computed(() => [
  { label: t("icons.house"), value: "demo:house" },
  { label: t("icons.settings"), value: "demo:settings" },
  { label: t("icons.analytics"), value: "demo:chart-no-axes-combined" },
]);
const iconTag = "SIcon";
const quickUsageCode = `<${iconTag} name="demo:rocket" :size="32" />
<${iconTag} name="demo:badge-check" :size="32" color="success" />
<${iconTag} :name="selected" :size="32" morph />`;
const usageCode = computed(() => [
  '<script setup lang="ts">',
  "import { ref } from 'vue';",
  "import { SIcon, SSelect } from 'sax-design-vue';",
  "const selected = ref('demo:house');",
  `const options = ${JSON.stringify(options.value, null, 2)};`,
  '<' + '/script>',
  '',
  '<template>',
  `  <${iconTag} name="demo:rocket" :size="32" />`,
  `  <${iconTag} name="demo:badge-check" :size="32" color="success" />`,
  '  <SSelect v-model="selected" :options="options" />',
  `  <${iconTag} :name="selected" :size="32" morph />`,
  '</template>',
].join('\n'));
const dockerCode = `docker run -d --name iconify-api --restart unless-stopped \\
  --pull never -p 3000:3000 \\
  -e ICONIFY_SOURCE=none -e ALLOW_UPDATE=false \\
  --mount type=bind,source=/srv/iconify/icon-sets,target=/data/iconify-api/icons,readonly \\
  iconify/api`;
const offlineDockerCode = `docker pull iconify/api
docker save -o iconify-api.tar iconify/api

docker load -i iconify-api.tar`;
const privateEnv = "SAX_ICON_API_URL=http://icons.intranet:3000";
const checkApi =
  'curl "http://icons.intranet:3000/lucide.json?icons=house,settings"';
const localIcon = {
  attributes: { viewBox: "0 0 56 48", fill: "none" },
  body: '<path d="M43 9H22C14.3 9 9 13.2 9 19s5.3 10 13 10h12c5.4 0 9 3.4 9 7.5S39.4 44 34 44H13" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
};
const svgCode = [
  '<script setup lang="ts">',
  "import { SIcon } from 'sax-design-vue';",
  `const iconData = ${JSON.stringify(localIcon, null, 2)};`,
  "<" + "/script>",
  "",
  "<template>",
  '  <SIcon :icon-data="iconData" :size="40" />',
  "</template>",
].join("\n");
</script>

<template>
  <div class="feature-page">
    <PageHeading
      :title="t('nav.icons')"
      :caption="t('icons.caption')"
      eyebrow="ICONS"
    />
    <ExampleSections :sections="[{ id: 'icons-use', title: 'icons.use' }, { id: 'icons-config', title: 'icons.config' }, { id: 'icons-private', title: 'icons.privateApi' }, { id: 'icons-svg', title: 'icons.svgSource' }]" />
    <div class="grid gap-5 min-w-0">
      <SCard
        class="admin-card min-w-0"
        id="icons-use"
        :title="t('icons.use')"
        :subtitle="t('icons.useCaption')"
      >
        <SAlert color="primary">{{ t("icons.apiTiming") }}</SAlert>
        <div class="flex flex-wrap items-center gap-6 py-6">
          <div class="flex items-center gap-3">
            <SIcon
              :icon-data="iconBuildProbe"
              :size="36"
              color="primary"
              :label="t('icons.rocket')"
            /><span>demo:rocket</span>
          </div>
          <div class="flex items-center gap-3">
            <SIcon
              name="demo:badge-check"
              :size="36"
              color="success"
              :label="t('icons.verified')"
            /><span>demo:badge-check</span>
          </div>
          <SSelect
            v-model="selected"
            :options="options"
            :aria-label="t('icons.select')"
          />
          <SIcon
            :name="selected"
            :size="36"
            color="primary"
            :label="t('icons.select')"
          /><STag>{{ selected }}</STag>
        </div>
        <SCodeBlock
          :code="quickUsageCode"
          language="vue"
          :download="false"
          :line-numbers="false"
        />
        <p class="text-sm text-muted leading-7 mt-4">{{ t("icons.names") }}</p>
        <SCodeBlock :code="usageCode" filename="IconExample.vue" language="vue" :expanded="false" :download="false" />
      </SCard>

      <SCard
        class="admin-card min-w-0"
        id="icons-config"
        :title="t('icons.config')"
        :subtitle="t('icons.configCaption')"
      >
        <SCodeBlock
          :code="apiCode"
          filename="sax-icons.config.ts"
          language="typescript"
          :download="false"
        />
        <p class="text-sm text-muted leading-7 mt-4">
          {{ t("icons.dynamicNote") }}
        </p>
        <p class="text-sm text-muted leading-7">{{ t("icons.menuNote") }}</p>
      </SCard>

      <SCard
        class="admin-card min-w-0"
        id="icons-private"
        :title="t('icons.privateApi')"
        :subtitle="t('icons.privateApiCaption')"
      >
        <ol class="grid gap-5 pl-5 leading-7">
          <li>
            <p>{{ t("icons.dockerStart") }}</p>
            <SCodeBlock
              :code="dockerCode"
              language="bash"
              :download="false"
              :line-numbers="false"
            />
            <div class="flex flex-wrap gap-5 mt-3 text-sm">
              <a
                href="https://hub.docker.com/r/iconify/api"
                target="_blank"
                rel="noreferrer"
                class="text-primary"
                >{{ t("icons.dockerImage") }}</a
              >
              <a
                href="https://github.com/iconify/api#docker"
                target="_blank"
                rel="noreferrer"
                class="text-primary"
                >{{ t("icons.deployDocs") }}</a
              >
            </div>
          </li>
          <li>
            <p>{{ t("icons.dockerOffline") }}</p>
            <SCodeBlock
              :code="offlineDockerCode"
              language="bash"
              :download="false"
              :line-numbers="false"
            />
          </li>
          <li>
            <p>{{ t("icons.setEndpoint") }}</p>
            <SCodeBlock
              :code="privateEnv"
              filename=".env.local"
              language="dotenv"
              :download="false"
              :line-numbers="false"
            />
          </li>
          <li>
            <p>{{ t("icons.verifyEndpoint") }}</p>
            <SCodeBlock
              :code="checkApi"
              language="bash"
              :download="false"
              :line-numbers="false"
            />
          </li>
        </ol>
        <SAlert color="primary">{{ t("icons.privateApiNote") }}</SAlert>
      </SCard>

      <SCard
        class="admin-card min-w-0"
        id="icons-svg"
        :title="t('icons.svgSource')"
        :subtitle="t('icons.svgSourceCaption')"
      >
        <div class="flex items-center gap-4 pb-5">
          <SIcon
            :icon-data="localIcon"
            :size="48"
            color="primary"
            :label="t('icons.brand')"
          /><span>{{ t("icons.svgPreview") }}</span>
        </div>
        <SCodeBlock
          :code="svgCode"
          filename="BrandIcon.vue"
          language="vue"
          :download="false"
        />
        <p class="text-sm text-muted leading-7 mt-4">
          {{ t("icons.svgNote") }}
        </p>
        <p class="text-sm text-muted leading-7">
          {{ t("icons.localSourceNote", { package: "@iconify-json/lucide" }) }}
        </p>
      </SCard>
    </div>
  </div>
</template>
