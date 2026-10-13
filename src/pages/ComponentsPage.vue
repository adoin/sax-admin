<script setup lang="ts">
import { shallowRef } from "vue";
import { STabs, STab } from "sax-design-vue";
import { t } from "@/i18n";
import PageHeading from "@/components/common/PageHeading.vue";
import FoundationExamples from "@/features/examples/FoundationExamples.vue";
import InputExamples from "@/features/examples/InputExamples.vue";
import FeedbackExamples from "@/features/examples/FeedbackExamples.vue";
import CardExamples from "@/features/examples/CardExamples.vue";
const active = shallowRef("foundation");
</script>
<template>
  <PageHeading
    :title="t('nav.components')"
    :caption="t('examples.caption')"
    eyebrow="COMPONENTS"
  /><STabs v-model="active" type="pill" :aria-label="t('nav.components')"
    ><STab name="foundation" :label="t('examples.foundation')"
      ><div class="mt-5"><FoundationExamples /></div></STab
    ><STab name="inputs" :label="t('examples.inputs')"
      ><div class="mt-5"><InputExamples /></div></STab
    ><STab name="feedback" :label="t('examples.feedback')"
      ><div class="mt-5"><FeedbackExamples /></div></STab
    ><STab name="cards" :label="t('examples.cards')"
      ><div class="mt-5"><CardExamples /></div></STab
  ></STabs>
</template>
