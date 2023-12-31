const define = process.env.NODE_ENV === 'production' ? {} : { global: 'window' }

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/preflight.css'],
  modules: ['@nuxtjs/tailwindcss', '@bg-dev/nuxt-naiveui'],
  vite: {
    define,
  },
  runtimeConfig: {
    public: {
      rpcUrl: process.env.NUXT_RPC_URL,
      protocolAddress: process.env.NUXT_PROTOCOL_ADDRESS
    }
  }
})
