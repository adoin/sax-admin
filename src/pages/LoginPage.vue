<script setup lang="ts">
const baseUrl = import.meta.env.BASE_URL;
import { t, locale, toggleLocale } from "@/i18n";
import { reactive, shallowRef } from "vue";
import { useRoute, useRouter } from "vue-smart-router";
import { SButton, SInput } from "sax-design-vue";
import {
  ArrowRight,
  Layers,
  ShieldCheck,
  ChartNoAxesCombined,
  Languages,
} from "lucide-vue-next";
import { authApi } from "@/api";
import { mockEnabled } from "@/api/client";
import { sessionStore } from "@/stores/session";
const form = reactive({ username: "admin", password: "123456" }),
  busy = shallowRef(false),
  error = shallowRef("");
const route = useRoute(),
  router = useRouter(),
  session = sessionStore();
async function login() {
  if (busy.value) return;
  error.value = "";
  if (!form.username || !form.password) {
    error.value = t("login.required");
    return;
  }
  busy.value = true;
  try {
    session.set(await authApi.login(form));
    const target =
      typeof route.query.redirect === "string"
        ? route.query.redirect
        : "/dashboard";
    await router.replace(
      target.startsWith("/") &&
        !target.startsWith("//") &&
        !target.startsWith("/login")
        ? target
        : "/dashboard",
    );
  } catch (e) {
    error.value = e instanceof Error ? e.message : t("error.loginFailed");
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-900">
    <section
      class="hidden lg:flex flex-col justify-between p-14 bg-[#101e3c] text-white relative overflow-hidden"
    >
      <span class="font-750 text-2xl"
        >sax<span class="text-blue-400">.</span> admin</span
      >
      <div class="relative z-1">
        <p class="text-blue-300 text-xs tracking-[.22em]">
          YOUR NEXT WORKSPACE
        </p>
        <h1 class="text-13 font-700 leading-tight tracking-tight mt-6 mb-6">
          {{ t("login.hero") }}<br />{{ t("login.heroSecond") }}
        </h1>
        <p class="text-slate-300 text-base leading-8 max-w-100">
          {{ t("login.heroBody") }}<br />{{ t("login.heroBodySecond") }}
        </p>
        <div class="flex gap-7 mt-12 text-sm text-blue-200">
          <span class="flex gap-2 items-center"
            ><Layers :size="17" />{{ t("login.config") }}</span
          ><span class="flex gap-2 items-center"
            ><ChartNoAxesCombined :size="17" />{{ t("login.visual") }}</span
          ><span class="flex gap-2 items-center"
            ><ShieldCheck :size="17" />{{ t("login.typed") }}</span
          >
        </div>
      </div>
      <span class="text-slate-400 text-xs">Built with Sax Design Vue</span>
      <div
        class="absolute w-150 h-150 rounded-full bg-blue-500/12 -right-70 -bottom-40"
      />
      <div
        class="absolute w-110 h-110 rounded-full bg-indigo-400/8 -right-40 -bottom-20"
      />
    </section>
    <section class="flex items-center justify-center px-7 py-12 relative">
      <SButton
        type="transparent"
        :debounce="false"
        class="absolute top-6 right-6 border-0 bg-transparent text-muted flex items-center gap-2 p-3 rounded-3"
        :aria-label="t('shell.language')"
        @click="toggleLocale"
      >
        <Languages :size="18" />{{
          locale === "zh-CN" ? "English" : "简体中文"
        }}
      </SButton>
      <div class="w-full max-w-92">
        <img :src="`${baseUrl}sax-logo-mark.svg`" alt="" class="w-11 h-11 mb-9" />
        <p class="text-xs text-muted tracking-widest">WELCOME BACK</p>
        <h2 class="text-8 font-700 tracking-tight mb-2 mt-3">
          {{ t("login.welcome") }}
        </h2>
        <p class="text-muted mb-9">{{ t("login.caption") }}</p>
        <form @submit.prevent="login" class="flex flex-col gap-5">
          <label class="field-label"
            >{{ t("login.username")
            }}<SInput
              v-model="form.username"
              block
              :placeholder="t('login.usernamePlaceholder')"
              autocomplete="username"
              class="mt-2" /></label
          ><label class="field-label"
            >{{ t("login.password")
            }}<SInput
              v-model="form.password"
              type="password"
              block
              :placeholder="t('login.passwordPlaceholder')"
              autocomplete="current-password"
              class="mt-2"
          /></label>
          <p v-if="error" role="alert" class="text-red-600 text-sm m-0">
            {{ error }}
          </p>
          <SButton block :loading="busy" class="mt-2"
            >{{ t("login.submit") }} <ArrowRight :size="16" class="ml-2"
          /></SButton>
        </form>
        <div
          v-if="mockEnabled"
          class="mt-7 p-4 rounded-3 bg-blue-50 dark:bg-slate-800 text-12px text-muted leading-6"
        >
          <b class="text-brand">{{ t("login.demo") }}</b
          ><br />{{ t("login.admin") }}: admin / 123456<br />{{
            t("login.viewer")
          }}: viewer / 123456
        </div>
        <p class="text-11px text-muted mt-9">
          Sax Admin · {{ t("login.tagline") }}
        </p>
      </div>
    </section>
  </div>
</template>
