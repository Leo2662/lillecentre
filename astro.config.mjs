// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Domaine propre : le site est servi à la racine, donc pas de `base`.
  site: 'https://lumlillecentre.fr',

  // Pages de service (QR, affiche) : hors sitemap.
  integrations: [
    sitemap({
      filter: (page) => !['/carte/qr', '/qr-code', '/llms.txt'].some((p) => page.includes(p)),
    }),
  ],
});