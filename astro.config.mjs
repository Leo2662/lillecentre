// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Domaine propre : le site est servi à la racine, donc pas de `base`.
  site: 'https://lumlillecentre.fr',

  // Styles intégrés à chaque page : aucune feuille à télécharger avant le
  // premier affichage. GitHub Pages ne garde ses fichiers en cache que dix
  // minutes, un fichier séparé ne ferait donc rien gagner d'une visite à
  // l'autre.
  build: { inlineStylesheets: 'always' },

  // Pages de service (QR, affiche, page d'erreur) et textes pour les IA :
  // hors sitemap.
  integrations: [
    sitemap({
      filter: (page) =>
        !['/carte/qr', '/qr-code', '/llms.txt', '/llms-full.txt', '/404'].some((p) =>
          page.includes(p),
        ),
    }),
  ],
});
