// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.PUBLIC_SITE_URL || undefined;

const integrations = [react()];

if (site) {
  integrations.push(
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !pathname.startsWith('/reporting') && pathname !== '/404/';
      },
      namespaces: {
        news: false,
        video: false,
      },
    }),
  );
}

// https://astro.build/config
export default defineConfig({
  site,
  integrations,
  vite: {
    plugins: [tailwindcss()],
  },
});
