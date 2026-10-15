<script setup lang="ts">
import { shallowRef } from "vue";
import { SCard, SUpload } from "sax-design-vue";
import { t } from "@/i18n";
import PageHeading from "@/components/common/PageHeading.vue";
import ExampleSections from "@/components/common/ExampleSections.vue";
import ProfileForm from "@/features/forms/ProfileForm.vue";
import RequestWizard from "@/features/forms/RequestWizard.vue";
import ContactForms from "@/features/forms/ContactForms.vue";
const files = shallowRef<File[]>([]);
</script>
<template>
  <PageHeading
    :title="t('nav.forms')"
    :caption="t('forms.caption')"
    eyebrow="FORMS"
  />
  <ExampleSections :sections="[{ id: 'forms-profile', title: 'forms.profile' }, { id: 'forms-contacts', title: 'forms.contacts' }, { id: 'forms-workflow', title: 'forms.workflow' }, { id: 'forms-files', title: 'forms.files' }]" />
  <section id="forms-profile"><ProfileForm /></section>
  <SCard id="forms-contacts" class="admin-card mt-5" :title="t('forms.contacts')" :subtitle="t('forms.contactsCaption')">
    <ContactForms />
  </SCard>
  <section id="forms-workflow" class="mt-5"><RequestWizard /></section>
  <section id="forms-files" class="mt-5">
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
  </section>
</template>
