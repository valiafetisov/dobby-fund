<script setup lang="ts">
import type { ThemeConfig } from '@bg-dev/nuxt-naiveui'

const themeConfig: ThemeConfig = {
  shared: {
    common: {
      primaryColor: 'rgb(30, 58, 138)', // equivalent to Tailwind's text-blue-900
      primaryColorHover: 'rgb(30, 58, 138)',
    },
    Tooltip: {
      color: 'white',
      textColor: 'black',
    },
  },
}
</script>

<template>
  <naive-config :theme-config="themeConfig" class="bg-neutral-100">
    <NNotificationProvider placement="top">
      <NuxtLayout name="default">
        <NuxtPage />
      </NuxtLayout>
    </NNotificationProvider>
  </naive-config>
</template>
