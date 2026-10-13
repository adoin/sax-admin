<script setup lang="ts">
import { shallowRef } from "vue";
import { SCard, SUpload } from "sax-design-vue";
import { t } from "@/i18n";
import PageHeading from "@/components/common/PageHeading.vue";
import ProfileForm from "@/features/forms/ProfileForm.vue";
import RequestWizard from "@/features/forms/RequestWizard.vue";
const files = shallowRef<File[]>([]);
</script>
<template>
  <PageHeading
    :title="t('nav.forms')"
    :caption="t('forms.caption')"
    eyebrow="FORMS"
  /><ProfileForm />
  <div class="mt-5"><RequestWizard /></div>
  <div class="mt-5">
    <SCard
      class="admin-card"
      :title="t('forms.files')"
      :subtitle="t('forms.filesCaption')"
      ><SUpload
        v-model="files"
        multiple
        accept="image/*,.pdf"
        :limit-count="3"
        :limit-size="5"
        :automatic="false"
        :show-submit-button="false"
    /></SCard>
  </div>
</template>
