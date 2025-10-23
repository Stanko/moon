/** @type {import('vite').UserConfig} */

export default {
  base: './',
  server: {
    port: 1234,
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'docs',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // or "modern"
      },
    },
  },
};
