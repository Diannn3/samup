// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.PUBLIC_SITE_URL || undefined;

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});
