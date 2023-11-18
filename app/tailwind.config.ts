export default {
  content: ['./components/**/*.{js,vue,ts}', './layouts/**/*.vue', './pages/**/*.vue', './plugins/**/*.{js,ts}', './nuxt.config.{js,ts}'],
  corePlugins: {
    // disabling preflight to manually add preflight style, else gives weird style overwriting. To get more information check out https://github.com/tailwindlabs/tailwindcss/issues/6602
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        text: '#525252',
      },
    },
  },
  variants: {},
  plugins: [],
}
