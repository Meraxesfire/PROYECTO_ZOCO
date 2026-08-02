// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.zocoeyewear.com',
  output: 'server',
  adapter: vercel({
    isr: {
      expiration: 300,
      exclude: [/^\/api\/.+/]
    }
  }),
  integrations: [sitemap()],
  devToolbar: {
    enabled: false
  },
  vite: {
    server: {
      allowedHosts: ['.loca.lt']
    }
  }

});
