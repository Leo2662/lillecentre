// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Domaine propre : le site est servi à la racine, donc pas de `base`.
  site: 'https://lumlillecentre.fr',

  // L'affiche QR est une page de service : hors sitemap.
  integrations: [sitemap({ filter: (page) => !page.includes('/carte/qr') })],
});