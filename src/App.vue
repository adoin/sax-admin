<script setup lang="ts">
import { RouterView } from "vue-smart-router";
import { SConfigProvider } from "sax-design-vue";
import zhCn from "sax-design-vue/es/locale/lang/zh-cn.mjs";
import en from "sax-design-vue/es/locale/lang/en.mjs";
import { locale } from "@/i18n";
</script>
<template>
  <SConfigProvider :locale="locale === 'zh-CN' ? zhCn : en"
    ><RouterView
  /></SConfigProvider>
</template>
