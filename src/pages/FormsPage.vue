<script setup lang="ts">
import { shallowRef } from "vue";
import { SCard, SUpload, SCodeBlock } from "sax-design-vue";
import { t } from "@/i18n";
import PageHeading from "@/components/common/PageHeading.vue";
import ProfileForm from "@/features/forms/ProfileForm.vue";
import RequestWizard from "@/features/forms/RequestWizard.vue";
import ContactForms from "@/features/forms/ContactForms.vue";
import contactSource from "@/features/forms/ContactForms.vue?raw";
const files = shallowRef<File[]>([]);
</script>
<template>
  <PageHeading
    :title="t('nav.forms')"
    :caption="t('forms.caption')"
    eyebrow="FORMS"
  /><ProfileForm />
  <SCard class="admin-card mt-5" :title="t('forms.contacts')" :subtitle="t('forms.contactsCaption')">
    <ContactForms />
    <div class="mt-5"><SCodeBlock :code="contactSource" language="vue" filename="ContactForms.vue" :expanded="false" :download="false" /></div>
  </SCard>
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
