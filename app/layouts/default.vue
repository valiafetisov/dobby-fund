<script setup lang="ts"></script>
<template>
  <div class="min-h-screen flex flex-col px-5 py-2 gap-y-2">
    <div class="flex justify-center">
      <nuxt-link to="/"><img src="~/assets/logo.png" width="130" height="auto" /></nuxt-link>
      <!-- <TheMenu /> -->
      <!-- <nuxt-link class="text-primary underline" to="#">Disclaimer</nuxt-link> -->
    </div>
    <div class="grow">
      <slot />
    </div>
    <div class="h-5 flex justify-center items-center">
      <span class="mr-2 h-full">Built for</span>
      <nuxt-link class="text-primary" to="https://ethglobal.com/events/istanbul" target="_blank"
        ><span class="underline">ETHGlobal Istanbul</span> <img src="~/assets/icons/head-earth.svg" class="w-6 h-6 inline-block"
      /></nuxt-link>
    </div>
  </div>
</template>
