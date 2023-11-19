<script setup lang="ts"></script>
<template>
  <div class="min-h-screen flex flex-col px-5 py-2 gap-y-2">
    <div class="flex justify-center">
      <nuxt-link to="/"><img src="~/assets/logo.png" width="100" height="auto" /></nuxt-link>
      <!-- <TheMenu /> -->
      <!-- <nuxt-link class="text-primary underline" to="#">Disclaimer</nuxt-link> -->
    </div>
    <div class="grow">
      <slot />
    </div>
    <div class="h-5 flex justify-center">
      Built for&nbsp;
      <nuxt-link class="text-primary underline" to="https://ethglobal.com/events/istanbul" target="_blank">ETHGlobal Istanbul</nuxt-link>
    </div>
  </div>
</template>
