// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/preflight.css'],
  modules: ['@nuxtjs/tailwindcss', '@bg-dev/nuxt-naiveui'],
});
